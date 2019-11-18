import {baseUrl} from "../js/const"
import FetchController from "../js/Helpers/FetchController";

export class ApiController {
  constructor(loaderVisibility) {
    this.api = new FetchController(loaderVisibility)
    this.database = "gsod";
    this.resetController();
  }

  setController = (context) => {
    context.date && (this.time = context.date);
    context.year && (this.year = context.year);
    this.withOffset(context.offset);
    this.withLimit(context.limit);
    this.withNeighbors(context.neighbors);
    this.withNearest(context.nearest);
    this.withPack(context.pack);
  };

  resetController = () => {
    this._time =
      this._year =
        this._offset =
          this._limit =
            this._pack =
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
    return this._year === null
      ? ''
      : this._year;
  }

  set year(value) {
    this._year = value;
  }

  withYear = (value) => {
    this._time = null;
    this._year = value;
    return this;
  };

  withNearest = (value) => {
    this._nearest = value;
    return this;
  };

  withNeighbors = (value) => {
    this._hasNeighbours = value;
    return this;
  };

  withPack = (flag) => {
    this._pack = flag;
    return this;
  };

  withTimeRange = (value) => {
    this._year = null;
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

  addTime = () => {
    return this.time.dateSet
      ? ('&since=' + this.time.startDate.format('DD.MM.YYYY') +
        '&until=' + this.time.endDate.format('DD.MM.YYYY'))
      : (this.year ? "&year=" + this.year : '');
  };

  addPack = () => {
    console.log(this._pack);
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
  createLatLonWithRadiusLink = (lat, lon, rad) => {
    return baseUrl + '/api/' + this.database +
      '/poly?type=circle&value=[' + lat + ',' + lon + ',' + rad + 'km]';
  };

  createPolyRequest = (e, bufferForOneSt) => {
    console.log(e);
    let req = "", lngs = null;
    if (bufferForOneSt || e.options.radius) {

      //hasOwnProperty 
      let lat =  e.latlng.lat || e._latlng.lat; // З _ це полігон, без - це точка. Хз чо так.
      let lng =  e.latlng.lng || e._latlng.lng ;
      let res = [lat, lng, (e.getRadius() / 1000 || bufferForOneSt) + 'km'];
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
    return baseUrl + '/api/gsod/' + queryValue;
  };

  // Final builder
  fetchData = (link) => {
    let req = link +
      this.addLimiters() +
      this.addNearestStations() +
      this.addNeighbours() +
      this.addTime() +
      this.addStatistics() +
      this.addPack();

    this.resetController();
    return this.api.Get(req)

  };

  // Fetch region. Each method will reset controller

  getStationByLatLon = (e, buffer) => {
    return this.fetchData(this.createPolyRequest(e, buffer))
  };

  getWeatherByLatLon = (lat, lon, rad) => {
    //TODO: append date
    return this.fetchData(this.createLatLonWithRadiusLink(lat, lon, rad))
  };

  getStationsFromMapEvent(e) {
    let link = this.createPolyRequest(e);
    return this.fetchData(link);
  }

  getWeatherFromMapEvent = (context) => {
    this.setController(context);
    if (this.YieldsToWeatherRequest()) {
      let link = this.createPolyRequest(context.e);
      return this.fetchData(link);
    }
  };

  getPackFromMapEvent = (context) => {
    this.setController(context);
    let link = this.createPolyRequest(context.e);
    return this.fetchData(link);
  };

  //upload Weather if we already have stations
  uploadWeather = (context) => {
    this.setController(context);
    let isWeatherRequest = this.YieldsToWeatherRequest();
    console.log(this.year);
    if (context.isMarkerSelected && isWeatherRequest) {
      console.log("Marker request!");
      return this.fetchData(context.markerRequest)

    } else if (context.isPolySelected && isWeatherRequest) {
      console.log("Poly request!");
      return this.fetchData(context.polyRequest)

    } else if (context.isPolySelected || context.isMarkerSelected) {
      alert("Nothing to search...") //Тут помилка, треба ретурн проміс
    }
  };

  //simple query searching for stations
  searchStationsByQuery = (context) => {
    this.withLimit = context.limit;
    this.withOffset = context.offset;
    this.withNearest = context.nearest;
    this.withNeighbors = context.neighbors;

    return this.fetchData(this.createQueryLink(context.selectedField, context.query));
  };

  getWeatherByQuery = (context) => {
    this.withLimit = context.limit;
    this.withOffset = context.offset;
    this.withNearest = context.nearest;
    this.withNeighbors = context.neighbors;
    context.date && (this.time = context.date) || context.year && (this.year = context.year);

    return this.fetchData(this.createQueryLink(context.selectedField, context.query));
  };

  getStationsCount() {
    return this.fetchData(baseUrl + "/api/gsod/countries/stationsCount")
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
