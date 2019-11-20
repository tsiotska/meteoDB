import {conditionState} from '../state';
import {types} from './conditionActions'

const conditionReducer = (state = conditionState, action) => {
  switch (action.type) {
    case types.IF_POLY_SELECTED:
      let flag = (!!action.req);
      return {
        ...state,
        areLimitAndOffsetDisabled: flag,
        polyRequest: action.req
      };
    case types.IF_MARKER_SELECTED:
      return {
        ...state,
        markerRequest: action.req
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
