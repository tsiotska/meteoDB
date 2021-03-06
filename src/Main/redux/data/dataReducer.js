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
    case types.SET_MARKERS_AND_STATIONS:
      return {
        ...state,
        markers: action.markers,
        stations: action.stations
      };
    case types.SET_SELECTED_STATION:
      console.log(action.selected)
      return {
        ...state,
        selectedStation: action.selected
      };
    case types.SET_POLY_REQUEST:
      let flag = (!!action.req);
      return {
        ...state,
        areLimitAndOffsetDisabled: flag,
        polyPayload: action.req
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
    case types.SET_QUERY:
      console.log(action.param)
      return {
        ...state,
        queryParam: action.param,
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
        selectedStation: null,
        markerRequest: "",
        polyPayload: "",
        queryRequest: "",
      };
    case types.ENABLE_WEATHER_SEARCH_BUTTON:
      return {
        ...state,
        enableWeatherSearchButton: action.flag,
      };
    default:
      return state;
  }
};

export default dataReducer;
