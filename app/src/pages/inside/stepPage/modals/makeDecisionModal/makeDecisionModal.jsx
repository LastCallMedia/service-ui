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

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { hideModalAction, withModal } from 'controllers/modal';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { activeProjectSelector } from 'controllers/user';
import { Accordion, useAccordionTabsState } from 'pages/inside/common/accordion';
import isEqual from 'fast-deep-equal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { historyItemsSelector } from 'controllers/log';
import { linkIssueAction, postIssueAction, unlinkIssueAction } from 'controllers/step';
import { LINK_ISSUE, POST_ISSUE, UNLINK_ISSUE } from 'common/constants/actionTypes';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import { MachineLearningSuggestions } from 'pages/inside/stepPage/modals/makeDecisionModal/machineLearningSuggestions';
import { SCREEN_MD_MAX } from 'common/constants/screenSizeVariables';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { actionMessages } from 'common/constants/localization/eventsLocalization';
import { messages } from './messages';
import {
  COPY_FROM_HISTORY_LINE,
  CURRENT_EXECUTION_ONLY,
  CURRENT_LAUNCH,
  MACHINE_LEARNING_SUGGESTIONS,
  MAKE_DECISION_MODAL,
  SEARCH_MODES,
  SELECT_DEFECT_MANUALLY,
} from './constants';
import { SelectDefectManually } from './selectDefectManually';
import { CopyFromHistoryLine } from './copyFromHistoryLine';
import { OptionsSection } from './optionsSection/optionsSection';

const MakeDecision = ({ data }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const historyItems = useSelector(historyItemsSelector);
  const isAnalyzerAvailable = !!useSelector(analyzerExtensionsSelector).length;
  const isBulkOperation = data.items && data.items.length > 1;
  const itemData = isBulkOperation ? data.items : data.items[0];
  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);
  const [modalState, setModalState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    source: {
      issue: isBulkOperation ? { comment: '' } : itemData.issue,
    },
    decisionType: SELECT_DEFECT_MANUALLY,
    issueActionType: '',
    optionValue: isAnalyzerAvailable && defectFromTIGroup ? CURRENT_LAUNCH : CURRENT_EXECUTION_ONLY,
    searchMode: isAnalyzerAvailable && defectFromTIGroup ? SEARCH_MODES.CURRENT_LAUNCH : '',
    testItems: [],
    selectedItems: [],
    suggestedItems: [],
    startTime: Date.now(),
  });
  const [tabs, toggleTab, collapseTabsExceptCurr] = useAccordionTabsState({
    [MACHINE_LEARNING_SUGGESTIONS]: isAnalyzerAvailable,
    [COPY_FROM_HISTORY_LINE]: false,
    [SELECT_DEFECT_MANUALLY]: true,
  });
  const [modalHasChanges, setModalHasChanges] = useState(false);
  const [loadingMLSuggest, setLoadingMLSuggest] = useState(false);
  useEffect(() => {
    setModalHasChanges(
      (isBulkOperation
        ? !!modalState.source.issue.issueType || !!modalState.source.issue.comment
        : modalState.decisionType === SELECT_DEFECT_MANUALLY &&
          !isEqual(itemData.issue, modalState.source.issue)) ||
        modalState.decisionType === COPY_FROM_HISTORY_LINE ||
        !!modalState.issueActionType ||
        modalState.decisionType === MACHINE_LEARNING_SUGGESTIONS,
    );
  }, [modalState]);

  useEffect(() => {
    if (!isBulkOperation) {
      setLoadingMLSuggest(true);
      fetch(URLS.getMLSuggestions(activeProject, itemData.id))
        .then((resp) => {
          if (resp.length !== 0) {
            setModalState({ suggestedItems: resp });
          }
          setLoadingMLSuggest(false);
        })
        .catch(() => {
          setLoadingMLSuggest(false);
          collapseTabsExceptCurr(SELECT_DEFECT_MANUALLY);
        });
    }
  }, []);

  const prepareDataToSend = ({ isIssueAction, replaceComment } = {}) => {
    const { issue } = modalState.source;
    if (isBulkOperation) {
      const { selectedItems: items } = modalState;
      return items.map((item) => {
        const comment = replaceComment
          ? issue.comment
          : `${item.issue.comment || ''}\n${issue.comment}`.trim();
        return {
          ...(isIssueAction ? item : {}),
          testItemId: item.id,
          issue: {
            ...item.issue,
            ...issue,
            comment,
            autoAnalyzed: false,
          },
        };
      });
    }
    return modalState.selectedItems.map((item, i) => {
      const comment =
        issue.comment !== item.issue.comment &&
        (modalState.decisionType === COPY_FROM_HISTORY_LINE || i !== 0)
          ? `${item.issue.comment || ''}\n${issue.comment}`.trim()
          : issue.comment || '';

      return {
        ...(isIssueAction ? item : {}),
        id: item.id || item.itemId,
        testItemId: item.id || item.itemId,
        issue: {
          ...issue,
          comment,
          autoAnalyzed: false,
        },
      };
    });
  };
  const sendSuggestResponse = () => {
    const dataToSend = modalState.suggestedItems.map((item) => {
      if (modalState.source.id === item.testItemResource.id) {
        return {
          ...item.suggestRs,
          userChoice: 1,
        };
      }
      return item.suggestRs;
    });
    fetch(URLS.choiceSuggestedItems(activeProject), {
      method: 'put',
      data: dataToSend,
    })
      .then(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.suggestedChoiceSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
      })
      .catch(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.suggestedChoiceFailed),
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );
      });
  };
  const saveDefect = (options) => {
    const { fetchFunc } = data;
    const issues = prepareDataToSend(options);
    const url = URLS.testItems(activeProject);

    if (modalState.suggestedItems.length > 0) {
      sendSuggestResponse();
    }

    fetch(url, {
      method: 'put',
      data: {
        issues,
      },
    })
      .then(() => {
        fetchFunc(issues);
        dispatch(
          showNotification({
            message: formatMessage(messages.updateDefectsSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
      })
      .catch(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.updateDefectsFailed),
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );
      });
    dispatch(hideModalAction());
  };

  const handlePostIssue = () => {
    const { postIssueEvents } = data.eventsInfo;
    dispatch(
      postIssueAction(prepareDataToSend({ isIssueAction: true }), {
        fetchFunc: data.fetchFunc,
        eventsInfo: postIssueEvents,
      }),
    );
  };
  const handleLinkIssue = () => {
    const { linkIssueEvents } = data.eventsInfo;
    dispatch(
      linkIssueAction(prepareDataToSend({ isIssueAction: true }), {
        fetchFunc: data.fetchFunc,
        eventsInfo: linkIssueEvents,
      }),
    );
  };
  const handleUnlinkIssue = () => {
    const { unlinkIssueEvents } = data.eventsInfo;
    const selectedItems = isBulkOperation
      ? prepareDataToSend({ isIssueAction: true }).filter(
          (item) => item.issue.externalSystemIssues.length > 0,
        )
      : prepareDataToSend({ isIssueAction: true });
    dispatch(
      unlinkIssueAction(selectedItems, {
        fetchFunc: data.fetchFunc,
        eventsInfo: unlinkIssueEvents,
      }),
    );
  };

  const getIssueAction = () => {
    switch (modalState.issueActionType) {
      case POST_ISSUE:
        return handlePostIssue();
      case LINK_ISSUE:
        return handleLinkIssue();
      case UNLINK_ISSUE:
        return handleUnlinkIssue();
      default:
        return false;
    }
  };
  const getOnApplyEvent = () => {
    const {
      eventsInfo: { editDefectsEvents = {} },
    } = data;
    const { onApply, onApplyAndContinue } = editDefectsEvents;
    const {
      decisionType,
      issueActionType,
      optionValue,
      selectedItems,
      suggestedItems,
      startTime,
    } = modalState;
    let eventInfo;
    const hasSuggestions = !!suggestedItems.length;
    if (isEqual(itemData.issue, modalState.source.issue) && issueActionType) {
      const issueActionLabel = issueActionType && actionMessages[issueActionType].defaultMessage;
      eventInfo =
        onApplyAndContinue &&
        onApplyAndContinue(defectFromTIGroup, hasSuggestions, issueActionLabel, defectFromTIGroup);
    } else {
      const section = messages[decisionType].defaultMessage;
      const optionLabel = messages[optionValue].defaultMessage;
      const selectedItemsLength = selectedItems.length;
      const timestamp = Date.now() - startTime;
      eventInfo =
        onApply &&
        onApply(
          section,
          defectFromTIGroup,
          hasSuggestions,
          optionLabel,
          selectedItemsLength,
          timestamp,
        );
    }
    return eventInfo;
  };
  const applyChangesImmediately = () => {
    if (isBulkOperation) {
      modalHasChanges &&
        (!!modalState.source.issue.issueType || !!modalState.source.issue.comment) &&
        saveDefect();
    } else {
      modalHasChanges && !isEqual(itemData.issue, modalState.source.issue) && saveDefect();
      trackEvent(getOnApplyEvent());
    }
    (modalState.decisionType === COPY_FROM_HISTORY_LINE ||
      modalState.decisionType === MACHINE_LEARNING_SUGGESTIONS) &&
      isEqual(itemData.issue, modalState.source.issue) &&
      dispatch(hideModalAction());
    modalState.issueActionType && dispatch(hideModalAction()) && getIssueAction();
  };
  const applyImmediatelyWithComment = () => {
    saveDefect({ replaceComment: true });
  };
  const applyChanges = () => applyChangesImmediately();

  const renderHeaderElements = () => {
    return (
      <>
        {isBulkOperation && (
          <GhostButton
            onClick={applyImmediatelyWithComment}
            disabled={
              modalState.source.issue.comment
                ? false
                : !modalState.selectedItems.some(({ issue }) => !!issue.comment)
            }
            transparentBorder
            transparentBackground
            appearance="topaz"
          >
            {formatMessage(
              modalState.source.issue.comment
                ? messages.replaceCommentsAndApply
                : messages.clearCommentsAndApply,
            )}
          </GhostButton>
        )}
        <GhostButton
          onClick={applyChanges}
          disabled={modalState.selectedItems.length === 0 || !modalHasChanges}
          color="''"
          appearance="topaz"
        >
          {modalState.selectedItems.length > 1
            ? formatMessage(messages.applyToItems, {
                itemsCount: modalState.selectedItems.length,
              })
            : formatMessage(
                modalState.issueActionType ? messages.applyAndContinue : messages.apply,
              )}
        </GhostButton>
      </>
    );
  };

  const getAccordionTabs = (collapsedRightSection, windowSize) => {
    const preparedHistoryLineItems = historyItems.filter(
      (item) => item.issue && item.id !== itemData.id,
    );
    const tabsData = [
      {
        id: MACHINE_LEARNING_SUGGESTIONS,
        shouldShow: !isBulkOperation,
        disabled: false,
        isOpen: tabs[MACHINE_LEARNING_SUGGESTIONS],
        title: <div>{formatMessage(messages.machineLearningSuggestions)}</div>,
        content: !isBulkOperation && (
          <MachineLearningSuggestions
            modalState={modalState}
            setModalState={setModalState}
            itemData={itemData}
            collapseTabsExceptCurr={collapseTabsExceptCurr}
            loadingMLSuggest={loadingMLSuggest}
            eventsInfo={data.eventsInfo.editDefectsEvents}
            isAnalyzerAvailable={isAnalyzerAvailable}
          />
        ),
      },
      {
        id: SELECT_DEFECT_MANUALLY,
        shouldShow: true,
        disabled: false,
        isOpen: tabs[SELECT_DEFECT_MANUALLY],
        title: formatMessage(messages.selectDefectTypeManually),
        content: (
          <SelectDefectManually
            itemData={itemData}
            modalState={modalState}
            setModalState={setModalState}
            isBulkOperation={isBulkOperation}
            collapseTabsExceptCurr={collapseTabsExceptCurr}
            collapsedRightSection={collapsedRightSection}
            windowSize={windowSize}
            eventsInfo={data.eventsInfo.editDefectsEvents}
          />
        ),
      },
    ];
    if (preparedHistoryLineItems.length > 0) {
      tabsData.splice(1, 0, {
        id: COPY_FROM_HISTORY_LINE,
        shouldShow: !isBulkOperation,
        disabled: false,
        isOpen: tabs[COPY_FROM_HISTORY_LINE],
        title: formatMessage(messages.copyFromHistoryLine),
        content: (
          <CopyFromHistoryLine
            items={preparedHistoryLineItems}
            itemData={itemData}
            modalState={modalState}
            setModalState={setModalState}
            collapseTabsExceptCurr={collapseTabsExceptCurr}
            windowSize={windowSize}
            eventsInfo={data.eventsInfo.editDefectsEvents}
          />
        ),
      });
    }
    return tabsData;
  };

  const hotKeyAction = {
    ctrlEnter: applyChanges,
  };

  const renderTitle = (collapsedRightSection, windowSize) => {
    const { width } = windowSize;
    if (isBulkOperation) {
      return formatMessage(collapsedRightSection ? messages.bulkOperationDecision : messages.bulk);
    } else {
      return formatMessage(
        collapsedRightSection && width > SCREEN_MD_MAX ? messages.decisionForTest : messages.test,
        {
          launchNumber: itemData.launchNumber && `#${itemData.launchNumber}`,
        },
      );
    }
  };

  const renderRightSection = (collapsedRightSection) => {
    return (
      <OptionsSection
        currentTestItem={itemData}
        modalState={modalState}
        setModalState={setModalState}
        isNarrowView={collapsedRightSection}
        isBulkOperation={isBulkOperation}
        eventsInfo={data.eventsInfo.editDefectsEvents}
      />
    );
  };
  const layoutEventsInfo = useMemo(() => {
    const { suggestedItems, startTime } = modalState;
    const hasSuggestions = !!suggestedItems.length;
    return {
      openCloseRightSection: (isOpen) =>
        data.eventsInfo.editDefectsEvents &&
        data.eventsInfo.editDefectsEvents.openCloseRightSection(defectFromTIGroup, isOpen),
      closeModal: (endTime) =>
        data.eventsInfo.editDefectsEvents &&
        data.eventsInfo.editDefectsEvents.closeModal(
          defectFromTIGroup,
          hasSuggestions,
          endTime - startTime,
        ),
    };
  }, [modalState.suggestedItems]);

  return (
    <DarkModalLayout
      renderTitle={renderTitle}
      renderHeaderElements={renderHeaderElements}
      modalHasChanges={modalHasChanges}
      hotKeyAction={hotKeyAction}
      modalNote={formatMessage(messages.modalNote)}
      renderRightSection={renderRightSection}
      eventsInfo={layoutEventsInfo}
    >
      {({ collapsedRightSection, windowSize }) => (
        <Accordion
          tabs={getAccordionTabs(collapsedRightSection, windowSize)}
          toggleTab={toggleTab}
        />
      )}
    </DarkModalLayout>
  );
};
MakeDecision.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.array,
    fetchFunc: PropTypes.func,
    eventsInfo: PropTypes.object,
  }).isRequired,
};
export const MakeDecisionModal = withModal(MAKE_DECISION_MODAL)(MakeDecision);
