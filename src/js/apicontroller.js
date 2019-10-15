import {baseUrl} from "../js/const"
//import WeathComposer from "js/Helpers/WeathComposer"
import FetchController from "../js/Helpers/FetchController"
import axios from 'axios';

export class ApiController {
  constructor(loadingStarted, loadingFinished, Progress) {
    this.api = new FetchController(loadingStarted, loadingFinished, Progress);
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
    if (!this.time && !this.year) {
      console.log("TIME is undefined ");
      this.year = '&year=2016'
    } else {
      console.log("TIME: ");
      console.log(this.year);
      console.log(this.time)
    }
    let radius = rad + 'km';
    let link = baseUrl + '/api/' + this.database + '/poly?type=' + type + '&value=[' + lat + ',' + lon + ',' + radius + ']' + (this.year || this.time);
    return this.fetchData(link)
  };

  getStationsIdsForYear = (year) => {
    ///api/gsod/stations?limit=1&year=2018
    let link = baseUrl + "/api/" + this.database + "stations?limit=1&year=" + year;
    return this.fetchData(link)
  };

  getForWban = (id, wban) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + "&wban=" + wban + this.year;
    return this.fetchData(link)
  };

  getForId = (id) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + this.year;
    return this.fetchData(link)
  }

}
