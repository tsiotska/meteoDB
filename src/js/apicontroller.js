import {baseUrl} from "../js/const"
import FetchController from "../js/Helpers/FetchController";
import ControllerContext from "./ControllerContext";
import axios from "axios";


export class ApiController extends ControllerContext {
  constructor(loaderVisibility) {
    super()
    this.api = new FetchController(loaderVisibility)
    this.resetController();
    this.database = "gsod";
  }

  setController = (context) => {
    console.log(context.date);
    this.database = context.database || "gsod";
    context.date && (this.time = context.date);
    context.years && (this.years = context.years);
    context.months && (this.months = context.months);
    context.days && (this.days = context.days);
    this.withOffset(context.offset);
    this.withLimit(context.limit);
    this.withNeighbors(context.neigh);
    this.withBuffer(context.buffer);
    this.withNearest(context.nearest);
    this.withPack(context.pack);
  }

  resetController = () => this.resetContext()

  // Link builders

  addNeighbours = () => {
    return this._hasNeighbours ? '&nbs' : ''
  }

  _getDateRangeParams = (e) => {
    return ('&since=' + this.time.startDate.format('DD.MM.YYYY') +
      '&until=' + this.time.endDate.format('DD.MM.YYYY'))
  }

  _getSingleTimeParams = (e) => {
    return (this._year ? "&years=" + this._year : '') +
      (this._months ? "&months=" + this._months : '') +
      (this._days ? "&days=" + this._days : '');
  }
  addTime = () => {
    return this.time.dateSet
      ? this._getDateRangeParams()
      : this._getSingleTimeParams();
  }
  addBuffer = () => {
    return this._buffer ? '&buffer=' + this._buffer : '';
  }

  addPack = () => {
    return this._pack ? '&pack' : '';
  }

  addLimiters = () => {
    return (this._offset ? '&offset=' + this._offset : '') +
      (this._limit ? '&limit=' + this._limit : '')
  }

  addStatistics = () => {
    return '' // statistics parameters in future versions
  }

  addNearestStations = () => {
    // returns nearest N stations for query
    return this._nearest ? '&nearest=' + this._nearest : ''
  }

  createGeoPolyRequest = () => {

  };
  // Link builders
  createPolyRequest = (newPolygon) => {
    let req;
    if (newPolygon.options.radius) {
      //Ось тут можна правити
      let lat = newPolygon.hasOwnProperty("_latlng") ? newPolygon._latlng.lat : newPolygon.latlng.lat;
      let lon = newPolygon.hasOwnProperty("_latlng") ? newPolygon._latlng.lng : newPolygon.latlng.lng;
      let res = [lat, lon, (newPolygon.options.radius / 1000) + 'km'];
      req = baseUrl + '/api/' + this.database + '/poly?type=circle&value=[' + res + ']';
    } else {
      let lngs = newPolygon._latlngs;
      req = baseUrl + '/api/' + this.database + '/poly?type=poly&value=[' + lngs.join('],[') + ']';
    }
    return req;
  };

  createQueryLink = (selectedField, query) => {
    let searchType = selectedField;
    let queryType = '&query=' + query;
    let queryValue = 'stations?field=' + searchType + queryType;
    let link =  baseUrl + '/api/' + this.database + '/' + queryValue;
    console.log(link);
    return link;
  }

  compileContext = (link) => {
    return link +
      this.addLimiters() +
      this.addNearestStations() +
      this.addNeighbours() +
      this.addBuffer() +
      this.addTime() +
      this.addStatistics() +
      this.addPack();
  }
  // Final builder
  fetchData = (req) => {
    this.resetController();
    return this.api.Get(req)
  };

  getDataForMapOrMarker(context) {
    this.setController(context);
    let link = this.createPolyRequest(context.e);
    return this.fetchData(this.compileContext(link));
  };

  //Можеш просто викликати getDataForMapAndMarker і передавати контекст, а це видалити.
  getStationsFromMapEvent(context) {
    return this.getDataForMapOrMarker(context);
  }

  getWeatherFromMapEvent = (context) => {
    return this.getDataForMapOrMarker(context);
  };

  getPackFromMapEvent = (context) => {
    return this.getDataForMapOrMarker(context);
  };

  getWeatherByGeoJson = (payload) => {
    return axios.post('/api/gsod/poly?type=mpoly', payload);
  };

  //fetch weather data if we already have stations
  getWeather = (context) => {
    this.setController(context);
    return this.fetchData(this.compileContext(context.markerRequest || context.polyRequest || context.queryRequest ))
  };

  buildQueryRequest = (context) =>{
    this.setController(context);
    let link = this.compileContext(this.createQueryLink(context.selectedField, context.queryParam));
    this.resetController();
    return link;
  };

  //Can be simplified in one
  searchStationsByQuery = (context) => {
    return this.fetchData(this.buildQueryRequest(context));
  };

  getWeatherByQuery = (context) => {
    return this.fetchData(this.buildQueryRequest(context));
  };

  getPackByQuery = (context) => {
    return this.fetchData(this.buildQueryRequest(context));
  };

  getStationsCount() {
    return this.fetchData(this.compileContext(baseUrl + "/api/" + this.database + "/countries/stationsCount"))
  }

  //extractors 
  getByType = (type, offsetValue, countValue) => {
    let offset = "", count = "";
    if (offsetValue) {
      offset = "&offset=" + offsetValue;
    }
    if (countValue) {
      count = "&limit=" + countValue;
    }
    let link = baseUrl + "/api/" + this.database + "/stations?extract=" + type + offset + count;
    return this.fetchData(this.compileContext(link))
  }
}
