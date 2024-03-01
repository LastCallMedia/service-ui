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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { projectIdSelector } from 'controllers/pages';
import { hideModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { fetch } from 'common/utils';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { setProjectIntegrationsAction } from 'controllers/plugins';
import {
  addFilterAction,
  fetchUserFiltersSuccessAction,
  removeFilterAction,
  activeFilterSelector,
} from 'controllers/filter';

import {
  UPDATE_DEFECT_TYPE,
  ADD_DEFECT_TYPE,
  DELETE_DEFECT_TYPE,
  ADD_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  PA_ATTRIBUTE_ENABLED_KEY,
  UPDATE_PA_STATE,
  FETCH_PROJECT,
  FETCH_PROJECT_PREFERENCES,
  FETCH_CONFIGURATION_ATTRIBUTES,
  HIDE_FILTER_ON_LAUNCHES,
  SHOW_FILTER_ON_LAUNCHES,
  UPDATE_PROJECT_FILTER_PREFERENCES,
  ADD_PROJECT_NOTIFICATION,
  NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY,
  UPDATE_NOTIFICATION_STATE,
  UPDATE_PROJECT_NOTIFICATION,
  DELETE_PROJECT_NOTIFICATION,
  FETCH_PROJECT_NOTIFICATIONS,
} from './constants';
import {
  updateDefectTypeSuccessAction,
  addDefectTypeSuccessAction,
  deleteDefectTypeSuccessAction,
  addPatternSuccessAction,
  updatePatternSuccessAction,
  deletePatternSuccessAction,
  updateConfigurationAttributesAction,
  fetchProjectPreferencesAction,
  fetchProjectSuccessAction,
  fetchProjectPreferencesSuccessAction,
  updateProjectFilterPreferencesAction,
  addProjectNotificationSuccessAction,
  fetchProjectNotificationsSuccessAction,
  deleteProjectNotificationSuccessAction,
  updateProjectNotificationSuccessAction,
  setProjectNotificationsLoadingAction,
  fetchExistingLaunchNamesSuccessAction,
} from './actionCreators';
import { patternsSelector, projectNotificationsSelector } from './selectors';

function* updateDefectType({ payload: defectTypes }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const data = {
      ids: defectTypes,
    };
    yield call(fetch, URLS.projectDefectType(projectId), {
      method: 'put',
      data,
    });
    yield put(updateDefectTypeSuccessAction(defectTypes));
    yield put(
      showNotification({
        messageId: 'updateDefectTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateDefectType() {
  yield takeEvery(UPDATE_DEFECT_TYPE, updateDefectType);
}

function* addDefectType({ payload: defectType }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const response = yield call(fetch, URLS.projectDefectType(projectId), {
      method: 'post',
      data: defectType,
    });
    yield put(addDefectTypeSuccessAction({ ...response, ...defectType }));
    yield put(
      showNotification({
        messageId: 'addDefectTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchAddDefectType() {
  yield takeEvery(ADD_DEFECT_TYPE, addDefectType);
}

function* deleteDefectType({ payload: defectType }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectDeleteDefectType(projectId, defectType.id), {
      method: 'delete',
    });
    yield put(deleteDefectTypeSuccessAction(defectType));
    yield put(
      showNotification({
        messageId: 'deleteDefectTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchDeleteDefectType() {
  yield takeEvery(DELETE_DEFECT_TYPE, deleteDefectType);
}

function* fetchProjectNotifications() {
  yield put(setProjectNotificationsLoadingAction(true));
  try {
    const projectId = yield select(projectIdSelector);
    const [notifications, existingLaunchNames] = yield all([
      call(fetch, URLS.notification(projectId)),
      call(fetch, URLS.launchesExistingNames(projectId)),
    ]);
    yield put(fetchProjectNotificationsSuccessAction(notifications));
    yield put(fetchExistingLaunchNamesSuccessAction(existingLaunchNames));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(setProjectNotificationsLoadingAction(false));
  }
}

function* watchFetchProjectNotifications() {
  yield takeEvery(FETCH_PROJECT_NOTIFICATIONS, fetchProjectNotifications);
}

function* updateNotificationState(enabled) {
  const projectId = yield select(projectIdSelector);
  const updatedConfig = {
    configuration: {
      attributes: {
        [NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY]: enabled.toString(),
      },
    },
  };

  yield call(fetch, URLS.projectByName(projectId), {
    method: 'put',
    data: updatedConfig,
  });
  yield put(updateConfigurationAttributesAction(updatedConfig));
}

function* addProjectNotification({ payload: notification }) {
  try {
    const projectId = yield select(projectIdSelector);

    const response = yield call(fetch, URLS.notification(projectId), {
      method: 'post',
      data: notification,
    });

    const notifications = yield select(projectNotificationsSelector);
    if (!notifications.length) {
      yield call(updateNotificationState, true);
    }

    yield put(addProjectNotificationSuccessAction({ ...notification, ...response }));
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchAddProjectNotification() {
  yield takeEvery(ADD_PROJECT_NOTIFICATION, addProjectNotification);
}

function* updateProjectNotification({ payload: notification }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);

    yield call(fetch, URLS.notification(projectId), {
      method: 'put',
      data: notification,
    });
    yield put(updateProjectNotificationSuccessAction(notification));
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateProjectNotification() {
  yield takeEvery(UPDATE_PROJECT_NOTIFICATION, updateProjectNotification);
}

function* deleteProjectNotification({ payload: id }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);

    yield call(fetch, URLS.notificationById(projectId, id), {
      method: 'delete',
    });
    yield put(deleteProjectNotificationSuccessAction(id));
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchDeleteProjectNotification() {
  yield takeEvery(DELETE_PROJECT_NOTIFICATION, deleteProjectNotification);
}

function* updateNotificationStateWithNotification({ payload: enabled }) {
  yield put(showScreenLockAction());
  try {
    yield call(updateNotificationState, enabled);
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateNotificationState() {
  yield takeEvery(UPDATE_NOTIFICATION_STATE, updateNotificationStateWithNotification);
}

function* updatePAState(PAEnabled) {
  const projectId = yield select(projectIdSelector);
  const updatedConfig = {
    configuration: {
      attributes: {
        [PA_ATTRIBUTE_ENABLED_KEY]: PAEnabled.toString(),
      },
    },
  };

  yield call(fetch, URLS.projectByName(projectId), {
    method: 'put',
    data: updatedConfig,
  });
  yield put(updateConfigurationAttributesAction(updatedConfig));
}

function* addPattern({ payload: pattern }) {
  try {
    const projectId = yield select(projectIdSelector);
    const response = yield call(fetch, URLS.projectAddPattern(projectId), {
      method: 'post',
      data: pattern,
    });
    const patterns = yield select(patternsSelector);
    if (!patterns.length) {
      yield call(updatePAState, true);
    }
    yield put(addPatternSuccessAction({ ...pattern, ...response }));
    yield put(
      showNotification({
        messageId: 'addPatternSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchAddPattern() {
  yield takeEvery(ADD_PATTERN, addPattern);
}

function* updatePattern({ payload: pattern }) {
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectUpdatePattern(projectId, pattern.id), {
      method: 'put',
      data: {
        name: pattern.name,
        enabled: pattern.enabled,
      },
    });
    yield put(updatePatternSuccessAction(pattern));
    yield put(
      showNotification({
        messageId: 'updatePatternSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchUpdatePattern() {
  yield takeEvery(UPDATE_PATTERN, updatePattern);
}

function* deletePattern({ payload: pattern }) {
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectUpdatePattern(projectId, pattern.id), { method: 'delete' });
    yield put(deletePatternSuccessAction(pattern));
    yield put(
      showNotification({
        messageId: 'deletePatternSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchDeletePattern() {
  yield takeEvery(DELETE_PATTERN, deletePattern);
}

function* updatePAStateWithNotification({ payload: PAEnabled }) {
  yield put(showScreenLockAction());
  try {
    yield call(updatePAState, PAEnabled);
    yield put(
      showNotification({
        messageId: 'updatePAStateSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdatePAState() {
  yield takeEvery(UPDATE_PA_STATE, updatePAStateWithNotification);
}

function* fetchProject({ payload: { projectId, fetchInfoOnly } }) {
  try {
    const project = yield call(fetch, URLS.projectByName(projectId));
    yield put(fetchProjectSuccessAction(project));
    yield put(setProjectIntegrationsAction(project.integrations));
    if (!fetchInfoOnly) {
      yield put(fetchProjectPreferencesAction(projectId));
    }
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchFetchProject() {
  yield takeEvery(FETCH_PROJECT, fetchProject);
}

function* fetchProjectPreferences({ payload: projectId }) {
  const userId = yield select(userIdSelector);
  const preferences = yield call(fetch, URLS.projectPreferences(projectId, userId));
  yield put(fetchProjectPreferencesSuccessAction(preferences));
  yield put(fetchUserFiltersSuccessAction(preferences.filters));
}

function* watchFetchProjectPreferences() {
  yield takeEvery(FETCH_PROJECT_PREFERENCES, fetchProjectPreferences);
}

function* fetchConfigurationAttributes({ payload: projectId }) {
  const project = yield call(fetch, URLS.projectByName(projectId));
  yield put(updateConfigurationAttributesAction(project));
}

function* watchFetchConfigurationAttributes() {
  yield takeEvery(FETCH_CONFIGURATION_ATTRIBUTES, fetchConfigurationAttributes);
}

function* hideFilterOnLaunches({ payload: filter }) {
  yield put(removeFilterAction(filter.id));
  yield put(updateProjectFilterPreferencesAction(filter.id, 'DELETE'));
}

function* watchHideFilterOnLaunches() {
  yield takeEvery(HIDE_FILTER_ON_LAUNCHES, hideFilterOnLaunches);
}

function* showFilterOnLaunches({ payload: filter }) {
  const activeFilter = yield select(activeFilterSelector);
  if (!activeFilter || filter.id !== activeFilter.id) {
    yield put(addFilterAction(filter));
    yield put(updateProjectFilterPreferencesAction(filter.id, 'PUT'));
  }
}

function* watchShowFilterOnLaunches() {
  yield takeEvery(SHOW_FILTER_ON_LAUNCHES, showFilterOnLaunches);
}

function* updateProjectFilterPreferences({ payload = {} }) {
  const { filterId, method } = payload;
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  yield call(fetch, URLS.projectPreferences(activeProject, userId, filterId), { method });
}

function* watchUpdateProjectFilterPreferences() {
  yield takeEvery(UPDATE_PROJECT_FILTER_PREFERENCES, updateProjectFilterPreferences);
}

export function* projectSagas() {
  yield all([
    watchUpdateDefectType(),
    watchAddDefectType(),
    watchDeleteDefectType(),
    watchAddPattern(),
    watchUpdatePattern(),
    watchUpdatePAState(),
    watchDeletePattern(),
    watchFetchProject(),
    watchFetchProjectPreferences(),
    watchFetchConfigurationAttributes(),
    watchHideFilterOnLaunches(),
    watchShowFilterOnLaunches(),
    watchUpdateProjectFilterPreferences(),
    watchAddProjectNotification(),
    watchUpdateNotificationState(),
    watchUpdateProjectNotification(),
    watchDeleteProjectNotification(),
    watchFetchProjectNotifications(),
  ]);
}
