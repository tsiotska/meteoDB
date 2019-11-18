import {dataState} from '../state';
import {types} from './dataActions';

const dataReducer = (state = dataState, action) => {
  switch (action.type) {
    case types.SET_PACK_LINK:
      console.log(action.link);
      return {
        ...state,
        currentPackLink: action.link,
      };
    default:
      return state;
  }
};

export default dataReducer;
