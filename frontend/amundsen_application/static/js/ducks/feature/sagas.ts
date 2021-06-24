import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as API from './api/v0';
import {
  getFeatureSuccess,
  getFeatureFailure,
  getFeatureDescriptionSuccess,
  getFeatureDescriptionFailure,
} from './reducer';
import {
  GetFeature,
  GetFeatureDescription,
  GetFeatureDescriptionRequest,
  UpdateFeatureDescription,
  UpdateFeatureDescriptionRequest,
} from './types';

export function* getFeatureWorker(action): SagaIterator {
  try {
    const { key, index, source } = action.payload;
    const response = yield call(API.getFeature, key, index, source);

    yield put(getFeatureSuccess(response));
  } catch (error) {
    yield put(getFeatureFailure(error));
  }
}

export function* getFeatureWatcher(): SagaIterator {
  yield takeEvery(GetFeature.REQUEST, getFeatureWorker);
}

export function* getFeatureDescriptionWorker(
  action: GetFeatureDescriptionRequest
): SagaIterator {
  const { payload } = action;
  const state = yield select();
  const { feature } = state.feature;
  try {
    const response = yield call(API.getFeatureDescription, feature.key);
    yield put(getFeatureDescriptionSuccess(response));
    if (payload.onSuccess) {
      yield call(payload.onSuccess);
    }
  } catch (e) {
    yield put(
      getFeatureDescriptionFailure({
        description: feature.description,
      })
    );
    if (payload.onFailure) {
      yield call(payload.onFailure);
    }
  }
}
export function* getFeatureDescriptionWatcher(): SagaIterator {
  yield takeEvery(GetFeatureDescription.REQUEST, getFeatureDescriptionWorker);
}

export function* updateFeatureDescriptionWorker(
  action: UpdateFeatureDescriptionRequest
): SagaIterator {
  const { payload } = action;
  const state = yield select();
  try {
    yield call(
      API.updateFeatureDescription,
      state.feature.feature.key,
      payload.newValue
    );
    if (payload.onSuccess) {
      yield call(payload.onSuccess);
    }
  } catch (e) {
    if (payload.onFailure) {
      yield call(payload.onFailure);
    }
  }
}
export function* updateFeatureDescriptionWatcher(): SagaIterator {
  yield takeEvery(
    UpdateFeatureDescription.REQUEST,
    updateFeatureDescriptionWorker
  );
}
