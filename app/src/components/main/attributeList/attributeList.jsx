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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import track from 'react-tracking';
import { notSystemAttributePredicate } from 'common/utils/attributeUtils';
import { EditableAttribute } from './editableAttribute';
import styles from './attributeList.scss';

const cx = classNames.bind(styles);

const createChangeHandler = (attributes, index, onChange, tracking, eventsInfo) => (attribute) => {
  const newAttributes = [...attributes];
  const { edited, ...newAttribute } = attribute;
  newAttributes[index] = newAttribute;
  onChange(newAttributes);
  if (Object.keys(eventsInfo).length > 0) {
    tracking.trackEvent(eventsInfo.addAttribute);
  }
};

const createRemoveHandler = (attributes, index, onChange) => () => {
  const newAttributes = [...attributes];
  newAttributes.splice(index, 1);
  onChange(newAttributes);
};

const isNewAttribute = (attribute) => !attribute.value;

const createCancelEditHandler = (attributes, index, onChange) => () => {
  const newAttributes = [...attributes];
  if (isNewAttribute(attributes[index])) {
    newAttributes.splice(index, 1);
  } else {
    const { edited, ...attribute } = newAttributes[index];
    newAttributes[index] = attribute;
  }
  onChange(newAttributes);
};

const hasEditedAttribute = (attributes) => attributes.some((attribute) => !!attribute.edited);

const createEditHandler = (attributes, index, onChange) => () => {
  if (hasEditedAttribute(attributes)) return;
  const newAttributes = [...attributes];
  newAttributes[index] = {
    ...newAttributes[index],
    edited: true,
  };
  onChange(newAttributes);
};

export const AttributeList = track()(
  ({
    attributes,
    onChange,
    onAddNew,
    disabled,
    keyURLCreator,
    valueURLCreator,
    newAttrMessage,
    maxLength,
    customClass,
    showButton,
    editable,
    backgroundDark,
    tracking,
    eventsInfo,
    maxCellWidth,
  }) => (
    <Fragment>
      {attributes.filter(notSystemAttributePredicate).map((attribute, i, filteredAttributes) => (
        <EditableAttribute
          key={`${attribute.key}_${attribute.value}`}
          attribute={attribute}
          attributes={filteredAttributes}
          editMode={attribute.edited}
          onChange={createChangeHandler(attributes, i, onChange, tracking, eventsInfo)}
          onRemove={createRemoveHandler(attributes, i, onChange)}
          onEdit={editable && createEditHandler(attributes, i, onChange)}
          onCancelEdit={createCancelEditHandler(attributes, i, onChange)}
          disabled={disabled}
          keyURLCreator={keyURLCreator}
          valueURLCreator={valueURLCreator}
          customClass={customClass}
          backgroundDark={backgroundDark}
          maxCellWidth={maxCellWidth}
        />
      ))}
      {!hasEditedAttribute(attributes) && !disabled && showButton && attributes.length < maxLength && (
        <div className={cx('add-new-button')} onClick={onAddNew}>
          +{' '}
          {newAttrMessage || (
            <FormattedMessage id="AttributeList.addNew" defaultMessage="Add new" />
          )}
        </div>
      )}
    </Fragment>
  ),
);
AttributeList.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.object),
  editedAttribute: PropTypes.object,
  disabled: PropTypes.bool,
  newAttrMessage: PropTypes.string,
  maxLength: PropTypes.number,
  customClass: PropTypes.string,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onAddNew: PropTypes.func,
  onRemove: PropTypes.func,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
  showButton: PropTypes.bool,
  editable: PropTypes.bool,
  backgroundDark: PropTypes.bool,
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }).isRequired,
  eventsInfo: PropTypes.object,
  maxCellWidth: PropTypes.number,
};
AttributeList.defaultProps = {
  attributes: [],
  editedAttribute: null,
  disabled: false,
  keyURLCreator: null,
  valueURLCreator: null,
  newAttrMessage: '',
  maxLength: Infinity,
  customClass: '',
  onChange: () => {},
  onRemove: () => {},
  onEdit: () => {},
  onAddNew: () => {},
  showButton: true,
  editable: true,
  backgroundDark: false,
  eventsInfo: {},
  maxCellWidth: 132,
};
