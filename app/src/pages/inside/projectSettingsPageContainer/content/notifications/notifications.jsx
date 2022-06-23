/*
 * Copyright 2022 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  projectNotificationsSelector,
  projectNotificationsStateSelector,
  updateProjectNotificationAction,
  deleteProjectNotificationAction,
  addProjectNotificationAction,
} from 'controllers/project';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
import { Button } from 'componentLibrary/button';
import { Checkbox } from 'componentLibrary/checkbox';
import {
  fetchProjectNotificationsAction,
  updateNotificationStateAction,
} from 'controllers/project/actionCreators';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import CopyIcon from 'common/img/newIcons/copy-inline.svg';
import { RuleList } from '../elements/ruleList';
import { Layout } from '../layout';
import styles from './notifications.scss';
import { DEFAULT_CASE_CONFIG } from './constants';
import { convertNotificationCaseForSubmission } from './utils';
import { messages } from './messages';
import { FieldElement } from '../elements';
import { NotificationRuleContent } from '../elements/notificationRuleContent';

const cx = classNames.bind(styles);
const COPY_POSTFIX = '_copy';

export const Notifications = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const projectRole = useSelector(activeProjectRoleSelector);
  const userRole = useSelector(userAccountRoleSelector);
  const enabled = useSelector(projectNotificationsStateSelector);
  const notifications = useSelector(projectNotificationsSelector);
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);

  useEffect(() => {
    dispatch(fetchProjectNotificationsAction());
  }, []);

  const isAbleToEditNotificationList = () => canUpdateSettings(userRole, projectRole);
  const isAbleToEditNotificationsEnableForm = () =>
    canUpdateSettings(userRole, projectRole) && isEmailIntegrationAvailable;

  const toggleNotificationsEnabled = (isEnabled) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_INPUT_NOTIFICATIONS);
    dispatch(updateNotificationStateAction(isEnabled));
  };

  const confirmAdd = (newNotification) => {
    const notification = convertNotificationCaseForSubmission(newNotification);
    dispatch(addProjectNotificationAction(notification));
  };

  const confirmEdit = (notification) => {
    dispatch(updateProjectNotificationAction({ ...notification, name: notification.ruleName }));
  };

  const confirmDelete = (id) => {
    dispatch(deleteProjectNotificationAction(id));
  };

  const onAdd = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.ADD_RULE_BTN_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          actionType: 'add',
          onSave: confirmAdd,
          notification: DEFAULT_CASE_CONFIG,
          notifications,
        },
      }),
    );
  };

  const onEdit = (notification) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RULE_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          actionType: 'edit',
          onSave: (data) => confirmEdit(data),
          notification,
          notifications,
        },
      }),
    );
  };

  const onDelete = (notification) => {
    trackEvent(SETTINGS_PAGE_EVENTS.CLICK_ON_DELETE_RULE_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'deleteNotificationModal',
        data: {
          onSave: () => confirmDelete(notification.id),
          eventsInfo: {
            closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_RULE_NOTIFICATIONS,
            cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_DELETE_RULE_NOTIFICATIONS,
            deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_RULE_NOTIFICATIONS,
          },
        },
      }),
    );
  };

  const onCopy = (notification) => {
    trackEvent(SETTINGS_PAGE_EVENTS.CLONE_NOTIFICATIONS);
    const { id, ...newNotification } = notification;
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          actionType: 'copy',
          onSave: confirmAdd,
          notification: {
            ...newNotification,
            ruleName: notification.ruleName + COPY_POSTFIX,
          },
          notifications,
        },
      }),
    );
  };

  useEffect(() => {
    setHeaderTitleNode(
      <span className={cx('button')} onClick={onAdd}>
        <Button disabled={!isAbleToEditNotificationList()}>{formatMessage(messages.create)}</Button>
      </span>,
    );

    return () => setHeaderTitleNode(null);
  });

  const onToggleHandler = (isEnabled, notification) => {
    trackEvent(
      isEnabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_NOTIFICATION_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_NOTIFICATION_RULE_SWITCHER,
    );
    dispatch(updateProjectNotificationAction({ ...notification, enabled: isEnabled }));
  };

  const readOnlyNotificationsEnableForm = !isAbleToEditNotificationsEnableForm();
  const readOnlyNotificationList = !isAbleToEditNotificationList();

  const actions = [
    {
      icon: CopyIcon,
      handler: onCopy,
    },
    {
      icon: PencilIcon,
      handler: onEdit,
    },
    {
      icon: BinIcon,
      handler: onDelete,
    },
  ];

  return (
    <>
      {notifications.length ? (
        <>
          <Layout description={formatMessage(messages.tabDescription)}>
            <FieldElement withoutProvider description={formatMessage(messages.toggleNote)}>
              <Checkbox
                disabled={readOnlyNotificationsEnableForm}
                value={enabled}
                onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
              >
                {formatMessage(messages.toggleLabel)}
              </Checkbox>
            </FieldElement>
          </Layout>
          <div className={cx('notifications-container')}>
            <RuleList
              disabled={readOnlyNotificationList}
              data={notifications.map((item) => ({ name: item.ruleName, ...item }))}
              actions={actions}
              onToggle={onToggleHandler}
              ruleItemContent={NotificationRuleContent}
            />
          </div>
        </>
      ) : (
        <EmptyStatePage
          title={formatMessage(messages.noItemsMessage)}
          description={formatMessage(messages.notificationsInfo)}
          buttonName={formatMessage(messages.create)}
          documentationLink={
            'https://reportportal.io/docs/Project-configuration%3Ee-mail-notifications'
          }
          disableButton={readOnlyNotificationList}
          handleButton={onAdd}
        />
      )}
    </>
  );
};
Notifications.propTypes = {
  enabled: PropTypes.bool,
  notifications: PropTypes.array,
  updateNotificationsConfig: PropTypes.func,
  showModal: PropTypes.func,
  projectRole: PropTypes.string,
  userRole: PropTypes.string,
  isEmailIntegrationAvailable: PropTypes.bool,
  setHeaderTitleNode: PropTypes.func.isRequired,
};
Notifications.defaultProps = {
  enabled: false,
  notifications: [],
  showModal: () => {},
  updateNotificationsConfig: () => {},
  projectRole: '',
  userRole: '',
  isEmailIntegrationAvailable: true,
};
