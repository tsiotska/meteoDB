import { baseUrl } from "../js/const"
import FetchController from "../js/Helpers/FetchController";

export class ApiController {
  constructor(loaderVisibility) {
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
    this.withNeighbors(context.neighbors);
    this.withBuffer(context.buffer);
    this.withNearest(context.nearest);
    this.withPack(context.pack);
  };

  resetController = () => {
      this._time =
      this._years =
      this._months =
      this._days =
      this._offset =
      this._limit =
      this._pack =
      this._buffer =
      this._nearest =
      this._hasNeighbours = null;
  };

  YieldsToWeatherRequest = () => {
    return (this.year || this.time.dateSet)
  };

  get time() {
    return this._time === null
      ? ''
      : this._time;
  }

  set time(value) {
    this._time = value;
  }

  get year() {
    return this._years === null
      ? ''
      : this._years;
  }

  set year(value) {
    this._years = value;
  }

  get months() {
    return this._months === null
      ? ''
      : this._months;
  }

  set months(value) {
    this._months = value;
  }

  get days() {
    return this._days === null
      ? ''
      : this._days;
  }

  set days(value) {
    this._days = value;
  }


  withYears = (value) => {
    this._time = null;
    this._years = value;
    return this;
  };


  withMonths = (value) => {
    this._months = null;
    this._months = value;
    return this;
  };


  withDays = (value) => {
    this._days = null;
    this._days = value;
    return this;
  };

  // nearest N stations related to current (one or each in poly) 
  // uses Kd-tree or R-tree
  withNearest = (value) => {
    this._nearest = value;
    return this;
  };

  // with an exterior buffer for polygon 
  withBuffer = (value) => {
    this._buffer = value;
    return this;
  };

  // all stations from neighbor countries (limited by 'limit' param)
  withNeighbors = (value) => {
    this._hasNeighbours = value;
    return this;
  };

  // link for file
  withPack = (flag) => {
    this._pack = flag;
    return this;
  };

  withTimeRange = (value) => {
    this._years = null;
    this._time = value;
    return this;
  }

  withOffset = (value) => {
    this._offset = value;
    return this;
  }

  withLimit = (value) => {
    this._limit = value;
    return this;
  };

  // Link builders

  addNeighbours = () => {
    return this._hasNeighbours ? '&nbs' : ''
  };

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
  };
  addBuffer = () => {
    return this._buffer ? '&buffer=' + this._buffer : '';
  }

  addPack = () => {
    return this._pack ? '&pack' : '';
  };

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

  // Link builders
  createPolyRequest = (e) => {
    let req = "", lngs = null;

    if (e.options.radius) {
      //Ось тут можна правити
      let lat = e.hasOwnProperty("_latlng") ? e._latlng.lat : e.latlng.lat;
      let lon = e.hasOwnProperty("_latlng") ? e._latlng.lng : e.latlng.lng;
      let res = [lat, lon, (e.options.radius / 1000) + 'km'];
      req = baseUrl + '/api/' + this.database + '/poly?type=circle&value=[' + res + ']';
    } else {
      lngs = e._latlngs;
      req = baseUrl + '/api/' + this.database + '/poly?type=poly&value=[' + lngs.join('],[') + ']';
    }
    return req;
  };

  createQueryLink = (selectedField, query) => {
    let searchType = selectedField;
    let queryType = '&query=' + query;
    let queryValue = 'stations?field=' + searchType + queryType;
    return baseUrl + '/api/' + this.database + '/' + queryValue;
  };

  // Final builder
  fetchData = (link) => {
    let req = link +
      this.addLimiters() +
      this.addNearestStations() +
      this.addNeighbours() +
      this.addBuffer() +
      this.addTime() +
      this.addStatistics() +
      this.addPack();

    this.resetController();
    return this.api.Get(req)
  };

  getDataForMapOrMarker(context) {
    this.setController(context);
    let link = this.createPolyRequest(context.e);
    return this.fetchData(link);
  }

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

  //upload Weather if we already have stations
  uploadWeather = (context) => {
    this.setController(context);

    if (context.markerRequest) {
      console.log("Marker section")
      return this.fetchData(context.markerRequest)

    } else if (context.polyRequest) {
      console.log("Poly section")
      return this.fetchData(context.polyRequest)

    } else if (context.polyRequest || context.markerRequest) {
      alert("Nothing to search...") //Бо тут буде помилка. Необхідно повернути пустий проміс.
    }
  };

  //simple query searching for stations
  searchStationsByQuery = (context) => {
    this.setController(context);
    return this.fetchData(this.createQueryLink(context.selectedField, context.query));
  };

  getWeatherByQuery = (context) => {
    this.setController(context);
    return this.fetchData(this.createQueryLink(context.selectedField, context.query));
  };

  getPackByQuery = (context) => {
    this.setController(context);
    return this.fetchData(this.createQueryLink(context.selectedField, context.query));
  };

  getStationsCount() {
    return this.fetchData(baseUrl + "/api/" + this.database + "/countries/stationsCount")
  }

  //extractors
  //Цей екстрактор мав би повертати обмежений лист query, якщо за той рік немає даних по якомусь параметру
  /* getByTypeAndYear = (year, type) => {
     let link = baseUrl + "/api/" + this.database + "/stations?extract=" + type + "&year=" + year;
     return this.fetchData(link)
   };*/

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
}
