import { createStore, combineReducers } from "redux";
import dataReducer from "./data/dataReducer";

const  store = createStore(combineReducers({dataReducer}));

export default store;

