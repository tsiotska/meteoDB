import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
//import Api from '...'

function* enableButton(action) {
  const results = yield call({type: "SET_YEARS", years: years});
  yield put({type: "ENABLE_BUTTON", results: results});
}

function* mySaga() {
  yield takeEvery("SET_YEARS", enableButton);
}

export default mySaga;