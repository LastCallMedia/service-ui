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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  tabDescription: {
    id: 'AutoAnalysis.tabDescription',
    defaultMessage:
      'Auto-Analysis allow to reduce the time spent on test execution investigation by analyzing test failures in automatic mode. The process of Auto-Analysis is based on previous user-investigated results using Machine Learning. More information about Auto-Analysis you can read in <a>Documentation</a>',
  },
  autoAnalysis: {
    id: 'AutoAnalysis.autoAnalysis',
    defaultMessage: 'Auto-Analysis',
  },
  autoAnalysisDescription: {
    id: 'AutoAnalysis.autoAnalysisDescription',
    defaultMessage: 'Active Auto-Analysis will start as soon as any launch is finished',
  },
  analyzerMode: {
    id: 'AutoAnalysis.AutoAnalysisMode',
    defaultMessage: 'Auto-Analysis based on',
  },
  analyzerModeDescription: {
    id: 'AutoAnalysis.AutoAnalysisModeDescription',
    defaultMessage:
      'You can choose the type of test item analysis based on previously investigated data in launches with the same name or in all launches',
  },
  minShouldMatch: {
    id: 'AutoAnalysis.minShouldMatch',
    defaultMessage: 'Minimum should match for Auto-Analysis',
  },
  minShouldMatchDescription: {
    id: 'AutoAnalysis.minShouldMatchDescription',
    defaultMessage:
      'Percent of words equality between analyzed log and particular log from the ElasticSearch. If a log from ElasticSearch has the value less then set, this log will be ignored for AA',
  },
  sameNameLaunchesCaption: {
    id: 'AutoAnalysis.sameNameLaunchesCaption',
    defaultMessage: 'Launches with the same name',
  },
  allLaunchesCaption: {
    id: 'AutoAnalysis.allLaunchesCaption',
    defaultMessage: 'All launches',
  },
  currentLaunch: {
    id: 'AutoAnalysis.current',
    defaultMessage: 'Only current launch',
  },
  previousLaunch: {
    id: 'AutoAnalysis.previousLaunch',
    defaultMessage: 'Previous launch with the same name',
  },
  currentAndTheSameName: {
    id: 'AutoAnalysis.currentAndWithSameName',
    defaultMessage: 'Current launch and Launches with the same name',
  },
  numberOfLogLines: {
    id: 'AutoAnalysis.numberOfLogLines',
    defaultMessage: 'Number of log lines should be considered in Elasticsearch',
  },
  numberOfLogLinesDescription: {
    id: 'AutoAnalysis.numberOfLogLinesDescription',
    defaultMessage:
      'The number of first lines of log message that should be considered in ElasticSearch',
  },
  numberOfLogLinesAllOption: {
    id: 'AutoAnalysis.numberOfLogLinesAllOption',
    defaultMessage: 'All',
  },
  allMessagesShouldMatchDescription: {
    id: 'AutoAnalysis.allMessagesShouldMatchDescription',
    defaultMessage: 'When an analyzed test item contains logs with 3 or more rows',
  },
  allMessagesShouldMatch: {
    id: 'AutoAnalysis.allMessagesShouldMatch',
    defaultMessage: 'All logs with 3 or more rows should match',
  },
});
