import {dataState} from '../state';
import {types} from './dataActions';

const dataReducer = (state = dataState, action) => {
  switch (action.type) {
    case types.SET_QUERY:
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
    case types.SET_YEARS:
      return {
        ...state,
        year: action.years,
      };
    case types.SET_MONTHS:
      return {
        ...state,
        year: action.months,
      };
    case types.SET_DAYS:
      return {
        ...state,
        year: action.days,
      };
    case types.SET_TIME:
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
    case types.ADD_POLY:
      let array = [action.polygon];
      Array.prototype.push.apply(array, state.polygons);
      console.log(array);
      return {
        ...state,
        polygons: array,
      };
    case types.SET_POLYGONS:
      return {
        ...state,
        polygons: action.polygons
      };
    case types.DELETE_LAST_POLY:
      console.log(state.polygons)
      let rest = state.polygons.filter((poly) => poly.layer !== action.polygon.layer);
      return {
        ...state,
        polygons: rest,
      };
    default:
      return state;
  }
};

export default dataReducer;
