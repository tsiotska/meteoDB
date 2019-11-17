import {baseUrl} from "../js/const"
import FetchController from "../js/Helpers/FetchController";

export class ApiController {
  constructor(loaderVisibility) {
    this.api = new FetchController(loaderVisibility)
    this.database = "gsod";
    this.resetController();
  }

  setController = (context) => {
    context.date && (this.time = context.date) || context.year && (this.year = context.year);
    this.withQuery = context.query;
    this.withOffset = context.offset;
    this.withLimit = context.limit;
    this.withNeighbors = context.neighbors;
    this.withNearest = context.nearest;
    this.polyRequest = context.polyRequest;
    this.markerRequest = context.markerRequest;
    this.withSelectedType = context.selectedField
  };

  resetController = () => {
    this._markerRequest =
      this._time =
        this._offset =
          this._limit =
            this._year =
              this._pack =
                this._nearest =
                  this._hasNeighbours = null;
  };

  YieldsToWeatherRequest = () => {
    console.log(this.year)
    return  (this.year || this.time.dateSet)
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

  set markerRequest(value) {
    this._markerRequest = value;
  }

  get markerRequest() {
    return this._markerRequest === null ? '' : this._markerRequest;
  }

  set polyRequest(value) {
    this._polyRequest = value;
  }

  get polyRequest() {
    return this._polyRequest === null ? '' : this._polyRequest;
  }

  withSelectedType = (type) => {
    this._type = type;
    return this;
  };

  withQuery = (value) => {
    this._query = value;
    return this;
  };

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
  addType = () => {
    return this._type ? '&field=' + this._type : '';
  };

  addNeighbours = () => {
    return this._hasNeighbours ? '&nbs' : ''
  };

  addTime = () => {
    return this.time
      ? ('&since=' + this.time.startDate.format('DD.MM.YYYY') +
        '&until=' + this.time.endDate.format('DD.MM.YYYY'))
      : (this.year ? "&year=" + this.year : '');
  };

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

  // Link builders
  createLatLonWithRadiusLink = (lat, lon, rad) => {
    let link = baseUrl + '/api/' + this.database +
      '/poly?type=circle&value=[' + lat + ',' + lon + ',' + rad + 'km]';
    this.markerRequest = link;
    return link;
  };

  createPackLink = (link) => {
    return link + '&pack';
  };

  createStationsLink = (query) => {
    return baseUrl + '/api/gsod/' + query
      + this.addNeighbours() + this.addNearestStations() + this.addLimiters();
  };

  createWeatherLink = (link) => {
    return link + this.addTime();
  };

  // Final builder
  fetchData = (link) => {
    //Ти не зміг би з одного білдера получити і погоду і станції і пак. Воно б змішалось в лінці.
    return this.api.Get(link)
  };

  // Fetch region. Each method will reset controller
  getPack = (link) => {
    this.resetController();
    this._pack = true;
    return this.fetchData(link);
  };

  getStationByLatLon = (lat, lon, rad) => {
    this.resetController();
    return this.fetchData(this.createLatLonWithRadiusLink(lat, lon, rad))
  };

  getWeatherByLatLon = (lat, lon, rad) => {
    //TODO: append date
    return this.fetchData(this.createLatLonWithRadiusLink(lat, lon, rad))
  };

  getStationsFromMapEvent(e) {
    console.log(e);
    let req = "", lngs = null;
    if (e.options.radius !== undefined) {
      let res = [e._latlng.lat, e._latlng.lng, e.getRadius() / 1000 + 'km'];
      req = baseUrl + '/api/' + this.database + '/poly?type=circle&value=[' + res + ']';
    } else {
      lngs = e._latlngs;
      req = baseUrl + '/api/' + this.database + '/poly?type=poly&value=[' + lngs.join('],[') + ']';
    }
    this.polyRequest = req;
    //createPackLink
    return this.fetchData(req);
  }

  getWeatherFromMapEvent = () => {
    let time = this.addTime();
    let link = this.polyRequest + time;
    console.log(link);
    if (time) {
      return this.fetchData(link);
    } else return [];
  };

  uploadWeather = (context) => {
    let isWeatherRequest = this.YieldsToWeatherRequest();
    if (context.isMarkerSelected && isWeatherRequest) {
      console.log("Marker request!");
      this.createWeatherLink(this.markerRequest)

    } else if (context.isPolySelected && isWeatherRequest) {
      console.log("Poly request!");
      this.createWeatherLink(this.polyRequest);

    } else if (context.isPolySelected || context.isMarkerSelected) {
      alert("Nothing to search...")
    }
  };

  searchByQuery(context) {
    let searchType = context.selectedField;
    let names = context.query;
    let queryType = '&query=' + names;

    let queryValue = 'stations?field=' + searchType + queryType;
    let stationRequest = this.createStationsLink(queryValue);

    let data = {stations: [], weather: null}; //Для перевірки null це фолс
    this.fetchData(stationRequest).then((stations) => {
      console.log("Stations getting...")
      data.stations = stations;
    }).catch((error) => {
      console.log(error)
    });

    if (this.YieldsToWeatherRequest()) {
      console.log("Weather getting...")
      let weatherRequest = this.createWeatherLink(stationRequest)
      this.fetchData(weatherRequest)
        .then((weather) => {
          data.weather = weather;
        })
        .catch((error) => {
          console.log(error)
        });
    }
    return data;
  }

  getStationsCount() {
    return this.fetchData(baseUrl + "/api/gsod/countries/stationsCount")
  }
}
