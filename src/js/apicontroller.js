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
  constructor(LoadingStarted, LoadingFinished, Progress) {
    this.state = {
      Status: status.UNDEFINED,
      Result: null,
      Errors: null,
      ProgressCallback: Progress,
      loaderOption: {
        xhr: this.OnFetchAjax,
        beforeSend: LoadingStarted,
        complete: LoadingFinished,
        success: (data) => {
          return data;
        },
        error: function() {
          return null;
        }
      }
    }
  }
  Clear = () => {
    this.state.Status = status.UNDEFINED;
    this.state.Result = this.state.Errors = null;
  }
  OnFetchAjax = () => {
    let callback = this.state.ProgressCallback
    this.Clear();
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
  GetDataContainers() {}
  GetStationsContainers() {}
  GetMarkers() {}
}
export class ApiController {
  constructor(LoadingStarted, LoadingFinished, Progress) {
    this.api = new FetchController(LoadingStarted, LoadingFinished, Progress)
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

  MainApiFetch = (link) => {
    return this.api.Get(link);
  }
  OfTimeExp = (exp) => {
    this._time = this._year = null;
    this._year = exp
    return this;
  }
  OfTime = (year) => {
    this._time = this._year = null;
    this._year = '&year=' + year
    return this;
  }
  OfRangeExp = (exp) => {
    this._time = this._year = null;
    this._time = exp
    return this;
  }
  OfRange = (start, end) => {
    this._time = this._year = null;
    this._time = '&s=' + start + '&e=' + end
    return this;
  }
  GetYears = () => {
    let link = baseUrl + "/api/db?years=";
    return this.MainApiFetch(link)
  }
  GetStationsCount = () => {
    let link = baseUrl + "/api/db?st_count="
    return this.MainApiFetch(link)
  }
  GetWeathForLatLon = (type, lat, lon) => {
    let link = baseUrl + '/api/db?t=' + type + '&of=0&lat=' + lat + '&lon=' + lon + (this.year || this.time);
    return this.MainApiFetch(link)
  }
  GetStations = () => {
    let link = baseUrl
    return this.MainApiFetch(link)
  }
  GetStationsIdsForYear = (year) => {
    let link = baseUrl + "/api/db?st_year=" + year
    return this.MainApiFetch(link)
  }
  GetWeatherInRange = (start, end) => {
    let link = baseUrl + this.time
    return this.MainApiFetch(link)
  }
  GetWeatherForStatons = () => {
    let link = baseUrl + ''
    return this.MainApiFetch(link)
  }

  GetForWban = (id, wban) => {
    let link = baseUrl + "/api/db?id=" + id + "&wban=" + wban + this.year
    return this.MainApiFetch(link)
  }
  GetForId = (id) => {
    let link = baseUrl + "/api/db?id=" + id + this.year
    return this.MainApiFetch(link)
  }

}
