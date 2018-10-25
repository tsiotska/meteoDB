import $ from 'jquery'

import {baseUrl} from "js/const"
let status = {
  OK: 100,
  SERVER_ERROR: 88,
  DEPRECATED: 66,
  NOT_FOUND: 33,
  INVALID_REQUEST: 32,
  UNDEFINED: 1,
  GENERIC_ERROR: 0
}
export class FetchController {
  constructor(loadingStarted, loadingFinished, Progress) {
    this.state = {
      Status: status.UNDEFINED,
      Result: null,
      Errors: null,
      ProgressCallback: Progress,
      loaderOption: {
        xhr: this.onFetchAjax,
        beforeSend: loadingStarted,
        complete: loadingFinished,
        success: (data) => {
          return data;
        },
        error: function() {
          return null;
        }
      }
    }
  }
  clear = () => {
    this.state.Status = status.UNDEFINED;
    this.state.Result = this.state.Errors = null;
  }
  onFetchAjax = () => {
    let callback = this.state.ProgressCallback
    this.clear();
    var xhr = new window.XMLHttpRequest(),
      lenx = 0;
    xhr.onreadystatechange = function() {
      if (this.readyState === this.HEADERS_RECEIVED) {
        lenx = Number.parseInt(xhr.getResponseHeader('Content-Length'), 10);
      }
    }
    xhr.addEventListener("progress", (evt) => {
      if (lenx !== 0 && callback) {
        callback(evt.loaded * 100 / lenx);
      }
    }, false);
    return xhr;
  }
  // Naming conflict -> refactor later
  Get = (link) => {
    return $.ajax(link, this.state.loaderOption).done((data) => {
      this.state.Status = data.code;
      this.state.Result = data.result;
      this.state.Errors = data.error;
    });
  }
}
export class WeathComposer {
  constructor(data) {
    this.data = data
  }
  getDataContainers() {}
  getStationsContainers() {}
  getMarkers() {}
}
export class ApiController {
  constructor(loadingStarted, loadingFinished, Progress) {
    this.api = new FetchController(loadingStarted, loadingFinished, Progress)
    this._time = this._year = null;
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
  }
  ofTimeExp = (exp) => {
    this._time = this._year = null;
    this._year = exp
    return this;
  }
  ofTime = (year) => {
    this._time = this._year = null;
    this._year = '&year=' + year
    return this;
  }
  ofRangeExp = (exp) => {
    this._time = this._year = null;
    this._time = exp
    return this;
  }
  ofRange = (start, end) => {
    this._time = this._year = null;
    this._time = '&s=' + start + '&e=' + end
    return this;
  }
  getYears = () => {
    let link = baseUrl + "/api/db?years=";
    return this.mainAPIFetch(link)
  }
  getStationsCount = () => {
    let link = baseUrl + "/api/db?st_count="
    return this.mainAPIFetch(link)
  }
  getWeathForLatLon = (type, lat, lon) => {
    let link = baseUrl + '/api/db?t=' + type + '&of=0&lat=' + lat + '&lon=' + lon + (this.year || this.time);
    return this.mainAPIFetch(link)
  }
  getStations = () => {
    let link = baseUrl
    return this.mainAPIFetch(link)
  }
  getStationsIdsForYear = (year) => {
    let link = baseUrl + "/api/db?st_year=" + year
    return this.mainAPIFetch(link)
  }
  getWeatherInRange = (start, end) => {
    let link = baseUrl + this.time
    return this.mainAPIFetch(link)
  }
  getWeatherForStations = () => {
    let link = baseUrl + ''
    return this.mainAPIFetch(link)
  }

  getForWban = (id, wban) => {
    let link = baseUrl + "/api/db?id=" + id + "&wban=" + wban + this.year
    return this.mainAPIFetch(link)
  }
  getForId = (id) => {
    let link = baseUrl + "/api/db?id=" + id + this.year
    return this.mainAPIFetch(link)
  }

}
