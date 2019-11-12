import {initialState} from './state';
import {types} from './actions'

const conditionReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.IF_POLY_SELECTED:
      console.log(action.flag);
      return {
        ...state,
        isPolySelected: action.flag,
        areLimitAndOffsetDisabled: action.flag,
      };
    case types.IF_MARKER_SELECTED:
      return {
        ...state,
        isMarkerSelected: action.flag,
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
