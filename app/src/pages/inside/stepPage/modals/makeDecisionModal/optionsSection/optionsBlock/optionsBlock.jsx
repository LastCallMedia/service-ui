/*
 * Copyright 2021 EPAM Systems
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
import { useTracking } from 'react-tracking';
import { useSelector } from 'react-redux';
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';
import classNames from 'classnames/bind';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { activeFilterSelector } from 'controllers/filter';
import { historyItemsSelector } from 'controllers/log';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import {
  ALL_LOADED_TI_FROM_HISTORY_LINE,
  CURRENT_EXECUTION_ONLY,
  LAST_TEN_LAUNCHES,
  SEARCH_MODES,
  CURRENT_LAUNCH,
  WITH_FILTER,
} from '../../constants';
import { messages } from '../../messages';
import styles from './optionsBlock.scss';

const cx = classNames.bind(styles);

export const OptionsBlock = ({
  optionValue,
  currentTestItem,
  loading,
  setModalState,
  eventsInfo,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const activeFilter = useSelector(activeFilterSelector);
  const historyItems = useSelector(historyItemsSelector);
  const isAnalyzerAvailable = !!useSelector(analyzerExtensionsSelector).length;
  const defectFromTIGroup = currentTestItem.issue.issueType.startsWith(
    TO_INVESTIGATE_LOCATOR_PREFIX,
  );
  const getOptions = () => {
    const options = [
      {
        ownValue: CURRENT_EXECUTION_ONLY,
        label: formatMessage(messages[CURRENT_EXECUTION_ONLY]),
      },
    ];
    if (defectFromTIGroup) {
      const optionalOptions = [
        {
          ownValue: CURRENT_LAUNCH,
          label: formatMessage(messages[CURRENT_LAUNCH]),
          disabled: !isAnalyzerAvailable,
          tooltip: formatMessage(
            isAnalyzerAvailable ? messages.currentLaunchTooltip : messages.analyzerUnavailable,
          ),
        },
        {
          ownValue: LAST_TEN_LAUNCHES,
          label: formatMessage(messages[LAST_TEN_LAUNCHES]),
          disabled: !isAnalyzerAvailable,
          tooltip: formatMessage(
            isAnalyzerAvailable ? messages.lastTenLaunchesTooltip : messages.analyzerUnavailable,
          ),
        },
      ];
      activeFilter &&
        activeFilter.id > 0 &&
        optionalOptions.push({
          ownValue: WITH_FILTER,
          label: formatMessage(messages[WITH_FILTER], {
            filterName: activeFilter.name,
          }),
          disabled: !isAnalyzerAvailable,
          tooltip: isAnalyzerAvailable
            ? formatMessage(messages.withFilterTooltip, {
                filterName: activeFilter.name,
              })
            : formatMessage(messages.analyzerUnavailable),
        });
      options.push(...optionalOptions);
    }
    historyItems.length > 0 &&
      historyItems.some(
        (item) => item.issue && item.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX),
      ) &&
      options.push({
        ownValue: ALL_LOADED_TI_FROM_HISTORY_LINE,
        label: formatMessage(messages[ALL_LOADED_TI_FROM_HISTORY_LINE]),
      });
    return options;
  };
  const setItemsFromHistoryLine = (value) => {
    const preparedHistoryItems = [
      currentTestItem,
      ...historyItems
        .reduce((items, item) => {
          if (!item.issue || item.id === currentTestItem.id) {
            return items;
          }
          return item.issue && item.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX)
            ? [...items, { ...item, itemId: item.id }]
            : items;
        }, [])
        .reverse(),
    ];
    setModalState({
      optionValue: value,
      searchMode: '',
      testItems: preparedHistoryItems,
      selectedItems: [preparedHistoryItems[0]],
    });
  };
  const onChangeOption = (value) => {
    let searchMode;
    switch (value) {
      case CURRENT_LAUNCH:
        searchMode = SEARCH_MODES.CURRENT_LAUNCH;
        break;
      case LAST_TEN_LAUNCHES:
        searchMode = SEARCH_MODES.LAST_TEN_LAUNCHES;
        break;
      case WITH_FILTER:
        searchMode = SEARCH_MODES.WITH_FILTER;
        break;
      default:
        searchMode = '';
    }
    value === ALL_LOADED_TI_FROM_HISTORY_LINE
      ? setItemsFromHistoryLine(value)
      : setModalState({
          optionValue: value,
          searchMode,
          testItems: [],
          selectedItems: [],
        });
    eventsInfo.onDecisionOption &&
      trackEvent(eventsInfo.onDecisionOption(defectFromTIGroup, messages[value].defaultMessage));
  };

  return (
    <div className={cx('options', { loading })}>
      <InputRadioGroup
        value={optionValue}
        onChange={onChangeOption}
        options={getOptions()}
        inputGroupClassName={cx('radio-input-group')}
        mode="dark"
      />
    </div>
  );
};
OptionsBlock.propTypes = {
  optionValue: PropTypes.string.isRequired,
  currentTestItem: PropTypes.object,
  loading: PropTypes.bool,
  setModalState: PropTypes.func,
  eventsInfo: PropTypes.object,
};
OptionsBlock.defaultProps = {
  currentTestItem: {},
  loading: false,
  setModalState: () => {},
  eventsInfo: {},
};
