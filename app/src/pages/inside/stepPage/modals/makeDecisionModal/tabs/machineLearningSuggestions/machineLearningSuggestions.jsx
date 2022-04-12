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
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { MACHINE_LEARNING_SUGGESTIONS } from '../../constants';
import { TestItemDetails } from '../../elements/testItemDetails';
import { messages } from '../../messages';

export const MachineLearningSuggestions = ({ modalState, itemData, eventsInfo }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const item = modalState.suggestChoice;
  const { logs, suggestRs } = item;

  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

  const onClickExternalLinkEvent = () => {
    const { onClickExternalLink } = eventsInfo;
    onClickExternalLink &&
      trackEvent(
        onClickExternalLink({
          defectFromTIGroup,
          section: messages[MACHINE_LEARNING_SUGGESTIONS].defaultMessage,
        }),
      );
  };
  const onClickItemEvent = () => {
    const { onClickItem } = eventsInfo;
    onClickItem &&
      trackEvent(
        onClickItem(defectFromTIGroup, messages[MACHINE_LEARNING_SUGGESTIONS].defaultMessage),
      );
  };
  const onOpenStackTraceEvent = () => {
    const { onOpenStackTrace } = eventsInfo;
    onOpenStackTrace &&
      trackEvent(
        onOpenStackTrace(defectFromTIGroup, messages[MACHINE_LEARNING_SUGGESTIONS].defaultMessage),
      );
  };

  return (
    <>
      <TestItemDetails
        item={item}
        logs={logs}
        highlightedLogId={suggestRs.relevantLogId}
        highlightedMessage={formatMessage(messages.similarLog)}
        showErrorLogs
        eventsInfo={{
          onOpenStackTraceEvent,
          onClickItemEvent,
          onClickExternalLinkEvent,
        }}
      />
    </>
  );
};

MachineLearningSuggestions.propTypes = {
  modalState: PropTypes.object.isRequired,
  itemData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  eventsInfo: PropTypes.object,
};
MachineLearningSuggestions.defaultProps = {
  items: [],
  itemData: {},
  eventsInfo: {},
};
