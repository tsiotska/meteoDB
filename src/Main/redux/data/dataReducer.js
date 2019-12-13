import {dataState} from '../state';
import {types} from './dataActions';

const dataReducer = (state = dataState, action) => {
  switch (action.type) {
    case types.SET_STATIONS:
      return {
        ...state,
        stations: action.stations
      };
    case types.SET_WEATHER:
      return {
        ...state,
        weather: action.weather
      };
    case types.SET_MARKERS:
      return {
        ...state,
        markers: action.markers
      };
    case types.SET_SELECTED_STATION:
      return {
        ...state,
        selectedStation: action.selected
      };
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
      return {
        ...state,
        queryRequest: action.req
      };
    case types.DISABLE_OFFSET_AND_LIMIT_BUTTON:
      return {
        ...state,
        areLimitAndOffsetDisabled: action.flag
      };
    case types.SET_QUERY:
      console.log(action.param)
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
    case types.SET_POLYGONS:
      return {
        ...state,
        polygons: action.polygons
      };
    case types.SET_GEO_POLYGONS:
      return {
        ...state,
        geoPolygons: action.polygons
      };
    case types.DELETE_LAST_POLY:
      console.log(state.polygons)
      let rest = state.polygons.filter((poly) => poly.layer !== action.polygon.layer);
      return {
        ...state,
        polygons: rest,
      };
    case types.REFRESH_EVERYTHING:
      return {
        ...state,
        queryParam: [],
        stationPackLink: null,
        weatherPackLink: null,
        date: {dateSet: false, startDate: null, endDate: null},
        years: null,
        months: null,
        days: null,
        limit: null,
        offset: null,
        nearest: false,
        neigh: null,

        polygons: [],
        geoPolygons: [],
        weather: [],
        stations : [],
        markers : [],
        selectedStation: [],
        markerRequest: "",
        polyRequest: "",
        queryRequest: "",
      };
    default:
      return state;
  }
};

export default dataReducer;
