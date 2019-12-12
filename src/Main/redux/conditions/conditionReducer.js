import {conditionState} from '../state';
import {types} from './conditionActions'


const conditionReducer = (state = conditionState, action) => {
  switch (action.type) {
    case types.SET_POLY_REQUEST:
      let flag = (!!action.req);
      console.log(action.req);
      return {
        ...state,
        areLimitAndOffsetDisabled: flag,
        polyRequest: action.req
      };
    case types.SET_MARKER_REQUEST:
      return {
        ...state,
        markerRequest: action.req
      };
    case types.SET_QUERY_REQUEST:
      console.log(action.req);
      return {
        ...state,
        queryRequest: action.req
      };
    case types.DISABLE_OFFSET_AND_LIMIT_BUTTON:
      return {
        ...state,
        areLimitAndOffsetDisabled: action.flag
      };
    default:
      return state;
  }
};

export default conditionReducer;
