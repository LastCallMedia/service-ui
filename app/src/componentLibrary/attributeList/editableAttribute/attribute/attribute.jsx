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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { formatAttributeWithSpacedDivider } from 'common/utils/attributeUtils';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './attribute.scss';

const cx = classNames.bind(styles);

export const Attribute = ({ attribute, onClick, onRemove, disabled, customClass, variant }) => {
  const onClickRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      className={cx('attribute', variant, customClass, { disabled })}
      onClick={disabled ? undefined : onClick}
    >
      <div className={cx('label', variant)}>{formatAttributeWithSpacedDivider(attribute)}</div>
      {!disabled && (
        <div className={cx('remove-icon', variant)} onClick={onClickRemove}>
          {Parser(CrossIcon)}
        </div>
      )}
    </div>
  );
};

Attribute.propTypes = {
  attribute: PropTypes.object,
  customClass: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  variant: PropTypes.string,
};

Attribute.defaultProps = {
  attribute: {},
  customClass: '',
  disabled: false,
  onClick: () => {},
  onRemove: () => {},
  variant: 'light',
};
