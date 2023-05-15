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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { logActivitySelector } from 'controllers/log';
import { AbsRelTime } from 'components/main/absRelTime';
import { NoItemMessage } from 'components/main/noItemMessage';
import { OwnerBlock } from 'pages/inside/common/itemInfo/ownerBlock';
import track from 'react-tracking';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { getActionMessage } from '../../utils/getActionMessage';
import { HistoryItem } from './historyItem';
import styles from './logItemActivity.scss';

export const messages = defineMessages({
  noActivities: {
    id: 'LogItemActivity.noActivities',
    defaultMessage: 'No activities to display',
  },
});

const cx = classNames.bind(styles);

@injectIntl
@connect((state) => ({
  activity: logActivitySelector(state),
}))
@track()
export class LogItemActivity extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activity: PropTypes.array.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  isAnalyzerActivity = ({ actionType }) =>
    actionType === 'analyze_item' || actionType === 'link_issue_aa';

  trackClickOnHistoryRelevantItemLink = () =>
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.CLICK_HISTORY_RELEVANT_ITEM_LINK);

  renderActivityItem = (activityItem) => {
    const { intl } = this.props;
    const isAnalyzerActivity = this.isAnalyzerActivity(activityItem);

    return (
      <div className={cx('activity-item')} key={activityItem.id}>
        {isAnalyzerActivity ? (
          <div className={cx('analyzer-user-column', 'column')}>
            <span className={cx('analyzer-user')}>{activityItem.user}</span>{' '}
            <span className={cx('action')}>{getActionMessage(intl, activityItem)}</span>
          </div>
        ) : (
          <Fragment>
            <div className={cx('user-column', 'column')}>
              <OwnerBlock owner={activityItem.user} />
            </div>
            <div className={cx('action-column', 'column')}>
              <span className={cx('action')}>{getActionMessage(intl, activityItem)}</span>
            </div>
          </Fragment>
        )}
        <div className={cx('time-column', 'column')}>
          <span className={cx('time')}>
            <AbsRelTime startTime={activityItem.lastModified} />
          </span>
        </div>
        <div className={cx('history-column', 'column')}>
          {activityItem.details.history.map((historyItem) => (
            <HistoryItem
              key={historyItem.field}
              historyItem={historyItem}
              onClick={this.trackClickOnHistoryRelevantItemLink}
            />
          ))}
        </div>
      </div>
    );
  };

  render() {
    const { intl, activity } = this.props;

    return (
      <div className={cx('container')}>
        {activity.length ? (
          activity.map(this.renderActivityItem)
        ) : (
          <NoItemMessage message={intl.formatMessage(messages.noActivities)} />
        )}
      </div>
    );
  }
}
