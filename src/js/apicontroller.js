import {baseUrl} from "../js/const"
import WeathComposer from "js/Helpers/WeathComposer"
import FetchController from "../js/Helpers/FetchController"

export class ApiController {
  constructor(loadingStarted, loadingFinished, Progress) {
    this.api = new FetchController(loadingStarted, loadingFinished, Progress);
    this._time = this._year = null;
    this.database = "gsod" // change later
  }

  get time() {
    return this._time === null
      ? ''
      : this._time;
  }

  set time(value) {
    this._time = value;
  }

  get year() {
    return this._year === null
      ? ''
      : this._year;
  }

  set year(value) {
    this._time = value;
  }

  mainAPIFetch = (link) => {
    return this.api.Get(link);
  };


  ofTimeExp = (exp) => {
    this._time = this._year = null;
    this._year = exp;
    return this;
  };

  ofTime = (year) => {
    this._time = this._year = null;
    this._year = '&year=' + year;
    return this;
  };

  ofRangeExp = (exp) => {
    this._time = this._year = null;
    this._time = exp;
    return this;
  };

  ofRange = (start, end) => {
    this._time = this._year = null;
    this._time = '&s=' + start + '&e=' + end;
    return this;
  };


  getYears = () => {
    let link = baseUrl + "/api/" + this.database + "years";
    return this.mainAPIFetch(link)
  };

  getStationsCount = () => {
    let link = baseUrl + "/api/" + this.database + "/db?st_count=";
    return this.mainAPIFetch(link)
  };

  getWeathForLatLon = (type, lat, lon) => {
    let link = baseUrl + '/api/' + this.database + '/db?t=' + type + '&of=0&lat=' + lat + '&lon=' + lon + (this.year || this.time);
    return this.mainAPIFetch(link)
  };

  getStations = () => {
    let link = baseUrl
    return this.mainAPIFetch(link)
  };

  getStationsIdsForYear = (year) => {
    let link = baseUrl + "/api/" + this.database + "/db?st_year=" + year;
    return this.mainAPIFetch(link)
  };

  getWeatherInRange = (start, end) => {
    let link = baseUrl + this.time
    return this.mainAPIFetch(link)
  };

  getWeatherForStations = () => {
    let link = baseUrl + ''
    return this.mainAPIFetch(link)
  };

  getForWban = (id, wban) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + "&wban=" + wban + this.year;
    return this.mainAPIFetch(link)
  };

  getForId = (id) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + this.year;
    return this.mainAPIFetch(link)
  }

}
