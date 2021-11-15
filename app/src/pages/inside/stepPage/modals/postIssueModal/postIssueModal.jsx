/*
 * Copyright 2019 EPAM Systems
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { fetch, updateSessionItem, getSessionItem } from 'common/utils';
import { URLS } from 'common/urls';
import { JIRA, RALLY } from 'common/constants/pluginNames';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import {
  namedAvailableBtsIntegrationsSelector,
  uiExtensionPostIssueFormSelector,
} from 'controllers/plugins';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { btsIntegrationBackLinkSelector } from 'controllers/testItem';
import { withModal } from 'components/main/modal';
import { DynamicFieldsSection } from 'components/fields/dynamicFieldsSection';
import {
  normalizeFieldsWithOptions,
  mapFieldsToValues,
} from 'components/fields/dynamicFieldsSection/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { ISSUE_TYPE_FIELD_KEY } from 'components/integrations/elements/bts/constants';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { hideModalAction } from 'controllers/modal';
import ErrorInlineIcon from 'common/img/error-inline.svg';
import Parser from 'html-react-parser';
import { ItemsList } from '../makeDecisionModal/executionSection/optionsSection/itemsList';
import { JiraCredentials } from './jiraCredentials';
import { RallyCredentials } from './rallyCredentials';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_LOGS_KEY,
  INCLUDE_COMMENTS_KEY,
  LOG_QUANTITY,
} from './constants';
import {
  validate,
  createFieldsValidationConfig,
  getDataSectionConfig,
  getDefaultIssueModalConfig,
  getDefaultOptionValueKey,
} from './utils';
import styles from './postIssueModal.scss';

const cx = classNames.bind(styles);

const SYSTEM_CREDENTIALS_BLOCKS = {
  [JIRA]: JiraCredentials,
  [RALLY]: RallyCredentials,
};

let validationConfig = null;

const messages = defineMessages({
  post: {
    id: 'PostIssueModal.post',
    defaultMessage: 'Post',
  },
  postIssue: {
    id: 'PostIssueModal.postIssue',
    defaultMessage: 'Post issue',
  },
  systemUrlInfo: {
    id: 'PostIssueModal.systemUrlInfo',
    defaultMessage: 'Issue will be posted to {systemUrl}',
  },
  includeDataHeader: {
    id: 'PostIssueModal.includeDataHeader',
    defaultMessage: 'Include data',
  },
  attachmentsHeader: {
    id: 'PostIssueModal.attachmentsHeader',
    defaultMessage: 'Attachments',
  },
  logsHeader: {
    id: 'PostIssueModal.logsHeader',
    defaultMessage: 'Logs',
  },
  commentsHeader: {
    id: 'PostIssueModal.commentsHeader',
    defaultMessage: 'Comments',
  },
  credentialsHeader: {
    id: 'PostIssueModal.credentialsHeader',
    defaultMessage: '{system} Credentials:',
  },
  noDefaultPropertiesMessage: {
    id: 'PostIssueModal.noDefaultPropertiesMessage',
    defaultMessage: 'Configure Bug Tracking System integration default properties to post bugs',
  },
  postIssueSuccess: {
    id: 'PostIssueModal.postIssueSuccess',
    defaultMessage: 'Ticket has been created.',
  },
  postIssueForTheTest: {
    id: 'PostIssueModal.postIssueForTheTest',
    defaultMessage: 'Post Issue for the test {launchNumber}',
  },
  postIssueFailed: {
    id: 'PostIssueModal.postIssueFailed',
    defaultMessage: 'Failed to post issue',
  },
  cancel: {
    id: 'PostIssueModal.cancel',
    defaultMessage: 'Cancel',
  },
});

@withModal('postIssueModal')
@reduxForm({
  form: 'postIssueForm',
  validate: (fields) => validate(fields, validationConfig),
})
@track()
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    namedBtsIntegrations: namedAvailableBtsIntegrationsSelector(state),
    userId: userIdSelector(state),
    getBtsIntegrationBackLink: (itemId) => btsIntegrationBackLinkSelector(state, itemId),
    postIssueExtensions: uiExtensionPostIssueFormSelector(state),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    hideModalAction,
  },
)
@injectIntl
export class PostIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    namedBtsIntegrations: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    getBtsIntegrationBackLink: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    postIssueExtensions: PropTypes.array,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    hideModalAction: PropTypes.func,
    invalid: PropTypes.bool,
  };

  static defaultProps = {
    postIssueExtensions: [],
    data: {
      items: [],
      fetchFunc: () => {},
      eventsInfo: {},
    },
  };

  constructor(props) {
    super(props);
    const {
      data: { items },
    } = props;
    const { pluginName, integration, ...config } = getDefaultIssueModalConfig(
      props.namedBtsIntegrations,
      props.userId,
    );

    const {
      id,
      integrationParameters: { defectFormFields },
    } = integration;
    const systemAuthConfig = this.getSystemAuthDefaultConfig(pluginName, config);
    const fields = this.initIntegrationFields(defectFormFields, systemAuthConfig, pluginName);

    this.state = {
      fields,
      pluginName,
      integrationId: id,
      expanded: true,
      wasExpanded: false,
      loading: false,
      testItems: items,
      selectedItems: items,
    };
  }

  onPost = () => {
    this.props.handleSubmit(this.prepareDataToSend)();
  };

  onChangePlugin = (pluginName) => {
    if (pluginName === this.state.pluginName) {
      return;
    }

    const { id, integrationParameters } = this.props.namedBtsIntegrations[pluginName][0];
    const systemAuthConfig = this.getSystemAuthDefaultConfig(pluginName);
    const fields = this.initIntegrationFields(
      integrationParameters.defectFormFields,
      systemAuthConfig,
      pluginName,
    );

    this.setState({
      pluginName,
      fields,
      integrationId: id,
    });
  };

  onChangeIntegration = (integrationId) => {
    if (integrationId === this.state.integrationId) {
      return;
    }

    const { integrationParameters } = this.props.namedBtsIntegrations[this.state.pluginName].find(
      (item) => item.id === integrationId,
    );
    const fields = this.initIntegrationFields(integrationParameters.defectFormFields);

    this.setState({
      fields,
      integrationId,
    });
  };

  trackFieldClick = (e, eventFn) => {
    this.props.tracking.trackEvent(eventFn(e.target.checked));
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }

    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getSystemAuthDefaultConfig = (pluginName, config) => {
    const systemAuthConfig = {};
    if (this.isJiraIntegration(pluginName)) {
      const storedConfig = config || getSessionItem(`${this.props.userId}_settings`) || {};
      systemAuthConfig.username = storedConfig.username;
    }
    return systemAuthConfig;
  };

  dataFieldsConfig = [
    {
      name: INCLUDE_ATTACHMENTS_KEY,
      title: this.props.intl.formatMessage(messages.attachmentsHeader),
      eventFn: this.props.data.eventsInfo && this.props.data.eventsInfo.attachmentsSwitcher,
    },
    {
      name: INCLUDE_LOGS_KEY,
      title: this.props.intl.formatMessage(messages.logsHeader),
      eventFn: this.props.data.eventsInfo && this.props.data.eventsInfo.logsSwitcher,
    },
    {
      name: INCLUDE_COMMENTS_KEY,
      title: this.props.intl.formatMessage(messages.commentsHeader),
      eventFn: this.props.data.eventsInfo && this.props.data.eventsInfo.commentSwitcher,
    },
  ];

  initIntegrationFields = (defectFormFields = [], defaultConfig = {}, pluginName) => {
    const defaultOptionValueKey = getDefaultOptionValueKey(pluginName);
    const fields = normalizeFieldsWithOptions(defectFormFields, defaultOptionValueKey).map((item) =>
      item.fieldType === ISSUE_TYPE_FIELD_KEY ? { ...item, disabled: true } : item,
    );
    validationConfig = createFieldsValidationConfig(fields);
    this.props.initialize({
      ...defaultConfig,
      ...getDataSectionConfig(!this.isBulkOperation),
      ...mapFieldsToValues(fields),
    });

    return fields;
  };

  prepareDataToSend = (formData) => {
    const { getBtsIntegrationBackLink } = this.props;

    const { selectedItems } = this.state;

    const fields = this.state.fields.map((field) => ({ ...field, value: formData[field.id] }));
    const backLinks = selectedItems.reduce(
      (acc, item) => ({ ...acc, [item.id]: getBtsIntegrationBackLink(item) }),
      {},
    );
    const data = {
      [INCLUDE_COMMENTS_KEY]: formData[INCLUDE_COMMENTS_KEY],
      [INCLUDE_ATTACHMENTS_KEY]: formData[INCLUDE_ATTACHMENTS_KEY],
      [INCLUDE_LOGS_KEY]: formData[INCLUDE_LOGS_KEY],
      logQuantity: LOG_QUANTITY,
      item: selectedItems[0].id,
      fields,
      backLinks,
    };
    if (this.isJiraIntegration()) {
      data.password = formData.password;
      data.username = formData.username;
    } else {
      data.token = formData.token;
    }

    this.postIssue(data);
  };

  postIssue = (data) => {
    const {
      intl: { formatMessage },
      data: { fetchFunc },
      namedBtsIntegrations,
      activeProject,
      userId,
    } = this.props;
    const { pluginName, integrationId, selectedItems } = this.state;
    const currentExtension = this.getCurrentExtension();
    const extensionAction = currentExtension && currentExtension.action;

    this.props.showScreenLockAction();

    const fetchAction = extensionAction
      ? extensionAction(data, integrationId)
      : fetch(URLS.btsIntegrationPostTicket(activeProject, integrationId), {
          method: 'post',
          data,
        });

    fetchAction
      .then((response) => {
        const {
          integrationParameters: { project, url },
        } = namedBtsIntegrations[pluginName].find((item) => item.id === integrationId);
        const issues = selectedItems.map(({ id, issue = {} }) => ({
          testItemId: id,
          issue: {
            ...issue,
            externalSystemIssues: [
              ...(issue.externalSystemIssues || []),
              {
                ticketId: response.id,
                url: response.url,
                btsProject: project,
                btsUrl: url,
              },
            ],
          },
        }));

        return fetch(URLS.testItem(activeProject), {
          method: 'put',
          data: { issues },
        });
      })
      .then(() => {
        fetchFunc();
        this.props.hideScreenLockAction();
        this.props.hideModalAction();
        const sessionConfig = {
          pluginName,
          integrationId,
        };

        if (this.isJiraIntegration()) {
          sessionConfig.username = data.username;
        }

        updateSessionItem(`${userId}_settings`, sessionConfig);
        this.props.showNotification({
          message: formatMessage(messages.postIssueSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.postIssueFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  isJiraIntegration = (pluginName = this.state.pluginName) => pluginName === JIRA;

  expandCredentials = () => {
    this.setState({
      expanded: !this.state.expanded,
      wasExpanded: true,
    });
  };

  componentDidMount() {
    const { intl, activeProject } = this.props;
    const { testItems } = this.state;
    const fetchLogs = () => {
      this.setState({ loading: true });
      const itemIds = testItems.map((item) => item.id);

      fetch(URLS.bulkLastLogs(activeProject), {
        method: 'post',
        data: { itemIds, logLevel: 'ERROR' },
      })
        .then((testItemLogs) => {
          const items = [];
          testItems.forEach((elem) => {
            items.push({ ...elem, logs: testItemLogs[elem.id] });
          });
          this.setState({
            testItems: items,
            loading: false,
          });
        })
        .catch(() => {
          this.setState({
            testItems: [],
            selectedItems: [],
            loading: false,
          });
          this.props.showNotification({
            message: intl.formatMessage(messages.linkIssueFailed),
            type: NOTIFICATION_TYPES.ERROR,
          });
        });
    };
    fetchLogs();
  }

  isBulkOperation = this.props.data.items.length > 1;

  renderIssueFormHeaderElements = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <>
        <GhostButton
          onClick={this.props.hideModalAction}
          transparentBorder
          transparentBackground
          appearance="topaz"
        >
          {formatMessage(messages.cancel)}
        </GhostButton>
        <GhostButton
          onClick={this.onPost}
          disabled={this.props.invalid}
          color="''"
          appearance="topaz"
        >
          {formatMessage(messages.postIssue)}
        </GhostButton>
      </>
    );
  };
  renderTitle = (collapsedRightSection) => {
    const {
      data: { items },
      intl: { formatMessage },
    } = this.props;
    return collapsedRightSection
      ? formatMessage(messages.postIssueForTheTest, {
          launchNumber: items.launchNumber && `#${items.launchNumber}`,
        })
      : formatMessage(messages.post);
  };

  setItems = (newState) => {
    this.setState(newState);
  };

  renderRightSection = (collapsedRightSection) => {
    const { testItems, selectedItems, loading } = this.state;
    return (
      <div className={cx('items-list')}>
        <ItemsList
          setItems={this.setItems}
          testItems={testItems}
          selectedItems={selectedItems}
          isNarrowView={collapsedRightSection}
          loading={loading}
          eventsInfo={this.props.data.eventsInfo}
        />
      </div>
    );
  };

  getCurrentExtension = () => {
    const { postIssueExtensions } = this.props;
    const { pluginName } = this.state;

    return postIssueExtensions.find((ext) => ext.pluginName === pluginName);
  };

  render() {
    const {
      namedBtsIntegrations,
      intl: { formatMessage },
      data: { eventsInfo = {} },
    } = this.props;
    const { pluginName, integrationId, fields, expanded, wasExpanded } = this.state;
    const CredentialsComponent = SYSTEM_CREDENTIALS_BLOCKS[pluginName];
    const currentExtension = this.getCurrentExtension();
    const layoutEventsInfo = {
      openCloseRightSection: eventsInfo.openCloseRightSection,
    };
    return (
      <DarkModalLayout
        renderHeaderElements={this.renderIssueFormHeaderElements}
        renderTitle={this.renderTitle}
        renderRightSection={this.renderRightSection}
        eventsInfo={layoutEventsInfo}
      >
        {() => (
          <form className={cx('post-issue-form', 'dark-view')}>
            <BtsIntegrationSelector
              namedBtsIntegrations={namedBtsIntegrations}
              pluginName={pluginName}
              integrationId={integrationId}
              onChangeIntegration={this.onChangeIntegration}
              onChangePluginName={this.onChangePlugin}
              darkView
            />
            {fields.length ? (
              <DynamicFieldsSection
                withValidation
                fields={fields}
                defaultOptionValueKey={getDefaultOptionValueKey(pluginName)}
                darkView
              />
            ) : (
              <div className={cx('no-default-properties-message')}>
                <div className={cx('icon')}>{Parser(ErrorInlineIcon)}</div>
                <span>{formatMessage(messages.noDefaultPropertiesMessage)}</span>
              </div>
            )}
            {!this.isBulkOperation && (
              <div className={cx('include-block-wrapper')}>
                <h4 className={cx('form-block-header', 'dark-view')}>
                  <span className={cx('header-text', 'dark-view')}>
                    {formatMessage(messages.includeDataHeader)}
                  </span>
                </h4>
                <div className={cx('include-data-block')}>
                  {this.dataFieldsConfig.map((item) => (
                    <FieldProvider
                      key={item.name}
                      name={item.name}
                      format={Boolean}
                      onChange={(e) => this.trackFieldClick(e, item.eventFn)}
                    >
                      <InputCheckbox>
                        <span className={cx('switch-field-label', 'dark-view')}>{item.title}</span>
                      </InputCheckbox>
                    </FieldProvider>
                  ))}
                </div>
              </div>
            )}
            {currentExtension && <currentExtension.component />}
            {CredentialsComponent && (
              <div className={cx('credentials-block-wrapper', { expanded })}>
                <h4 className={cx('form-block-header', 'dark-view')}>
                  <span onClick={this.expandCredentials} className={cx('header-text', 'dark-view')}>
                    {formatMessage(messages.credentialsHeader, {
                      system: pluginName,
                    })}
                  </span>
                </h4>
                <div className={cx('credentials-block', { expand: wasExpanded })}>
                  <CredentialsComponent darkView />
                </div>
              </div>
            )}
          </form>
        )}
      </DarkModalLayout>
    );
  }
}
