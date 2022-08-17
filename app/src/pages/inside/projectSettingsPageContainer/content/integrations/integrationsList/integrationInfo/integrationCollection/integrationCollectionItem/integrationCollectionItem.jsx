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
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { projectIdSelector } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import styles from './integrationCollectionItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  ConnectionErrorMessage: {
    id: 'IntegrationsDescription.ConnectionErrorMessage',
    defaultMessage: 'Connection Error',
  },
});

export const IntegrationCollectionItem = ({
  id,
  title,
  creator,
  creationInfo,
  disabled,
  openIntegration,
}) => {
  const [connected, setConnected] = useState(true);
  const projectId = useSelector(projectIdSelector);
  const activeProject = useSelector(activeProjectSelector);
  const { formatMessage } = useIntl();

  useEffect(() => {
    fetch(URLS.testIntegrationConnection(projectId || activeProject, id))
      .then(() => {
        setConnected(true);
      })
      .catch(() => {
        setConnected(false);
      });
  }, []);

  const itemClickHandler = () => {
    openIntegration(id);
  };
  return (
    <li className={cx('instances-list-item', { disabled })}>
      <div className={cx('item-data')}>
        <div className={cx('general-info')}>
          <h4 className={cx('integration-name')}>{title}</h4>
          {!connected && (
            <span className={cx('connection-error-message')}>
              {formatMessage(messages.ConnectionErrorMessage)}
            </span>
          )}
        </div>
        <span className={cx('creation-info')}>
          {creator ? `${creator} on ${creationInfo}` : creationInfo}
        </span>
      </div>

      <div onClick={itemClickHandler} className={cx('arrow-control')}>
        {Parser(ArrowIcon)}
      </div>
    </li>
  );
};

IntegrationCollectionItem.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string.isRequired,
  creationInfo: PropTypes.string.isRequired,
  creator: PropTypes.string,
  disabled: PropTypes.bool,
  openIntegration: PropTypes.func,
};

IntegrationCollectionItem.defaultProps = {
  title: '',
  creationInfo: '',
  creator: '',
  disabled: false,
  openIntegration: () => {},
};
