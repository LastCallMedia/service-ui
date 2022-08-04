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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
import { IntegrationsListItem } from './integrationsListItem';
import styles from './integrationsList.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const IntegrationsList = (props) => {
  const { formatMessage } = useIntl();
  const { availableIntegrations } = props;

  return (
    <>
      {Object.keys(availableIntegrations).length ? (
        <div className={cx('integrations-list')}>
          {Object.keys(availableIntegrations).map((key) => (
            <div key={key} className={cx('integrations-group')}>
              <div className={cx('integrations-group-header')}>
                {messages[key] ? formatMessage(messages[key]) : key}
              </div>
              <div className={cx('integrations-group-items')}>
                {availableIntegrations[key].map((item) => (
                  <IntegrationsListItem key={item.name} integrationType={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyStatePage
          title={formatMessage(messages.noIntegrationsMessage)}
          description={formatMessage(messages.noIntegrationsDescription)}
          documentationLink={'https://reportportal.io/docs/Project-configuration%3Eintegrations'}
          descriptionClassName={cx('integration-empty')}
        />
      )}
    </>
  );
};

IntegrationsList.propTypes = {
  availableIntegrations: PropTypes.object.isRequired,
};
