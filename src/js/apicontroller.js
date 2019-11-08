import {baseUrl} from "../js/const"
//import WeathComposer from "js/Helpers/WeathComposer"
import FetchController from "../js/Helpers/FetchController";

import axios from 'axios';

export class ApiController {
  constructor(loaderVisibility) { //loadingStarted, loadingFinished, Progress,
    this.api = new FetchController(loaderVisibility); //loadingStarted, loadingFinished, Progress,
    this._time = this._year = null;
    this.database = "gsod"; // change later
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

  ofTimeExp = (exp) => {
    this._time = this._year = null;
    this._year = exp;
    return this;
  };

  ofRangeExp = (exp) => {
    this._time = this._year = null;
    this._time = exp;
    return this;
  };

  fetchData = (link) => {
    return this.api.Get(link);
  };

  getPack = (req) => {
    let link = req + '&pack';
    return this.fetchData(link);
  };

  getYears = () => { //Беремо просто роки
    let link = baseUrl + "/api/" + this.database + "/years";
    return this.fetchData(link);
  };

  getStationByLatLon = (type, lat, lon, rad) => {
    let radius = rad + 'km';
    let link = baseUrl + '/api/' + this.database + '/poly?type=' + type + '&value=[' + lat + ',' + lon + ',' + radius + ']';
    return this.fetchData(link)
  };

  getWeathByLatLon = (type, lat, lon, rad) => {
    let radius = rad + 'km';
    let link = baseUrl + '/api/' + this.database + '/poly?type=' + type + '&value=[' + lat + ',' + lon + ',' + radius + ']' + (this.year || this.time);
    return this.fetchData(link)
  };

  //extractors
  getByTypeAndYear = (year, type) => {
    let link = baseUrl + "/api/" + this.database + "/stations?extract=" + type + "&year=" + year;
    return this.fetchData(link)
  };

  getByType = (type, offsetValue, countValue) => {
    let offset = "", count = "";
    if (offsetValue) {
      offset = "&offset=" + offsetValue;
    }
    if (countValue) {
      count = "&limit=" + countValue;
    }
    let link = baseUrl + "/api/" + this.database + "/stations?extract=" + type + offset + count;
    return this.fetchData(link)
  };

  /*getStationsIdsForYear = (year) => {
    let link = baseUrl + "/api/" + this.database + "/stations?limit=3&year=" + year;
    return this.fetchData(link)
  };*/

  getForWban = (id, wban) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + "&wban=" + wban + this.year;
    return this.fetchData(link)
  };

  getForId = (id) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + this.year;
    return this.fetchData(link)
  }

}
