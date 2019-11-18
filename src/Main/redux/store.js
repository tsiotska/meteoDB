import { createStore, combineReducers, applyMiddleware } from "redux";
import createSagaMiddleware from 'redux-saga';
import conditionReducer from "./conditionReducer";
import mySaga from './sagas/sagas';

const sagaMiddleware = createSagaMiddleware();
const  store = createStore(combineReducers({conditionReducer}), applyMiddleware(sagaMiddleware));

//sagaMiddleware.run(mySaga);
export default store;

