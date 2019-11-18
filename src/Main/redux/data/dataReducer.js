import {dataState} from '../state';
import {types} from './dataActions';

const dataReducer = (state = dataState, action) => {
  switch (action.type) {
    case types.SET_QUERY:
      return {
        ...state,
        queryParam: action.param,
      };
    case types.SET_PACK_LINK:
      return {
        ...state,
        currentPackLink: action.link,
      };
    case types.SET_YEAR:
      //Перевірки можна робити в редюсері
      if (action.year.length === 4) {
        return {
          ...state,
          year: action.year,
        };
      } else {
        return {
          ...state,
          year: null,
        };
      }
    case types.SET_TIME:
      console.log(action.date)
      return {
        ...state,
        date: action.date,
      };
    //It sets neight nearest offset limit. And can do it with many others if its required and doesnt make you confused
    case types.SET_ANY_INPUT_DATA:
      return {
        ...state,
        [action.data]: action.data,
      };
    default:
      return state;
  }
};

export default dataReducer;
