import {dataState} from '../state';
import {types} from './dataActions';

const dataReducer = (state = dataState, action) => {
  switch (action.type) {
    case types.SET_QUERY:
      console.log(action.param);
      return {
        ...state,
        queryParam: action.param,
      };
    case types.SET_STATION_PACK_LINK:
      return {
        ...state,
        stationPackLink: action.link,
      };
    case types.SET_WEATHER_PACK_LINK:
      return {
        ...state,
        weatherPackLink: action.link,
      };
    case types.SET_YEAR:
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
        [action.kind]: action.data,
      };
    case types.SET_LAST_POLY:
      let array = [action.event];
      if(state.lastPoly.length > 0){
        Array.prototype.push.apply(array, state.lastPoly);
      }
      return {
        ...state,
        lastPoly: array,
      };
    case types.DELETE_LAST_POLY:
      let lastPoly = state.lastPoly;
      let rest = lastPoly.filter((pl) => pl.layer !== action.event.layer);
      return {
        ...state,
        lastPoly: rest,
      };
    default:
      return state;
  }
};

export default dataReducer;
