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

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { addDefectTypeAction, defectTypesSelector } from 'controllers/project';
import { userAccountRoleSelector, activeProjectRoleSelector } from 'controllers/user';
import { canUpdateSettings } from 'common/utils/permissions';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { Button } from 'componentLibrary/button';
import CreateDefectIcon from 'common/img/newIcons/create-subtype-inline.svg';
import DefectGroupIcon from 'common/img/newIcons/defect-group-inline.svg';
import {
  Divider,
  TabDescription,
} from 'pages/inside/projectSettingsPageContainer/content/elements';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { showModalAction } from 'controllers/modal';
import { MAX_DEFECT_TYPES_COUNT } from 'pages/inside/projectSettingsPageContainer/content/defectTypes/constants';
import { DefectTypeRow } from './defectTypeRow';
import { messages } from './defectTypesMessages';
import styles from './defectTypes.scss';

const cx = classNames.bind(styles);

const CreateDefectTooltip = ({ formatMessage }) => (
  <span className={cx('create-tooltip')}>{formatMessage(messages.createDefectIcon)}</span>
);
CreateDefectTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const CreateDefect = withHoverableTooltip({
  TooltipComponent: CreateDefectTooltip,
  data: {
    placement: 'bottom',
    dynamicWidth: true,
  },
})(({ onClick }) => (
  <i className={cx('group-create')} onClick={onClick}>
    {Parser(CreateDefectIcon)}
  </i>
));

CreateDefect.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export const DefectTypes = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const defectTypes = useSelector(defectTypesSelector);
  const userAccountRole = useSelector(userAccountRoleSelector);
  const userProjectRole = useSelector(activeProjectRoleSelector);

  const addDefect = (data) => {
    dispatch(addDefectTypeAction({ ...data }));
  };
  const onAdd = (defectGroup) => {
    dispatch(
      showModalAction({
        id: 'addEditDefectTypeModal',
        data: {
          onSave: addDefect,
          actionType: 'add',
          defectType: { color: defectGroup.color, typeRef: defectGroup.typeRef },
          defectTypes,
        },
      }),
    );
  };

  const isEditable = canUpdateSettings(userAccountRole, userProjectRole);
  const canAddNewDefectType = useMemo(
    () =>
      DEFECT_TYPES_SEQUENCE.reduce((acc, groupName) => defectTypes[groupName].length + acc, 0) <
      MAX_DEFECT_TYPES_COUNT,
    [defectTypes],
  );
  const interactionAllowed = isEditable && canAddNewDefectType;

  useEffect(() => {
    setHeaderTitleNode(
      <span className={cx('button')}>
        <Button
          disabled={!isEditable || !canAddNewDefectType}
          onClick={() => onAdd(defectTypes[DEFECT_TYPES_SEQUENCE[0]][0])}
        >
          {formatMessage(messages.createDefectHeader)}
        </Button>
      </span>,
    );

    return () => setHeaderTitleNode(null);
  }, [defectTypes, canAddNewDefectType, isEditable]);

  return (
    <>
      <TabDescription>{formatMessage(messages.description)}</TabDescription>
      <Divider />
      <div className={cx('defect-types-list')}>
        {DEFECT_TYPES_SEQUENCE.map((groupName) => {
          return (
            <div key={groupName} className={cx('defect-type-group')}>
              <div className={cx('group-info')}>
                <div className={cx('group-type')}>
                  <i
                    className={cx('group-diagram', {
                      [`type-${groupName.toLowerCase()}`]: groupName,
                    })}
                  >
                    {Parser(DefectGroupIcon)}
                  </i>
                  <div className={cx('group-name')}>
                    {formatMessage(messages[groupName.toLowerCase()])}
                  </div>
                </div>
                {interactionAllowed && (
                  <CreateDefect
                    formatMessage={formatMessage}
                    onClick={() => onAdd(defectTypes[groupName][0])}
                  />
                )}
              </div>
              <div className={cx('group-field-list')}>
                <span>{formatMessage(messages.defectNameCol)}</span>
                <span>{formatMessage(messages.abbreviationCol)}</span>
              </div>
              <Divider />
              <div className={cx('group-content')}>
                {defectTypes[groupName].map((defectType, i) => (
                  <div key={defectType.id}>
                    <DefectTypeRow
                      data={defectType}
                      parentType={defectTypes[groupName][0]}
                      group={i === 0 ? defectTypes[groupName] : null}
                      isPossibleUpdateSettings={isEditable}
                    />
                    <Divider />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
DefectTypes.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};
