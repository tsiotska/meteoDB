import { createStore, combineReducers, applyMiddleware } from "redux";
import createSagaMiddleware from 'redux-saga';
import conditionReducer from "./conditions/conditionReducer";
import dataReducer from "./data/dataReducer";

//import mySaga from './sagas/sagas';

const sagaMiddleware = createSagaMiddleware();
const  store = createStore(combineReducers({conditionReducer, dataReducer}), applyMiddleware(sagaMiddleware));

//sagaMiddleware.run(mySaga);
export default store;

