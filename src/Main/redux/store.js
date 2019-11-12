import { createStore, combineReducers} from "redux";
import conditionReducer from "./conditionReducer";
//import menuReducer from ""

const  store = createStore(combineReducers({conditionReducer}));

export default store;

