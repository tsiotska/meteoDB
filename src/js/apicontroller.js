import {baseUrl} from "../js/const"
import FetchController from "../js/Helpers/FetchController";

export class ApiController {
  constructor(loaderVisibility) {
    this.api = new FetchController(loaderVisibility)
    this.database = "gsod";
    this.resetController();
    let date = {
      time: "",
      year: ""
    }
  }

  resetController = () => {
    this._time =
      this._offset =
        this._limit =
          this._year =
            this._pack =
              this._nearest =
                this._hasNeighbours = null;
  };

  YieldsToWeatherRequest = () => this.year || this.time;

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
    console.log("Setter of year")
    this._year = value;
  }

  set markerRequest(value) {
    this._markerRequest = value;
  }

  get markerRequest() {
    return this._markerRequest === null ? '' : this._markerRequest;
  }

  set polyRequest(value) {
    this._markerRequest = value;
  }

  get polyRequest() {
    return this._markerRequest === null ? '' : this._markerRequest;
  }

  // Fluent api region
  withYear = (value) => {
    this._time = null;
    this._year = value;
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
  }

  // Link builders
  addNeighbours = () => {
    return this._hasNeighbours ? '&nbs' : ''
  }

  getTime = () => {
    return this.time
      ? ('&since=' + this.time.startDate.format('DD.MM.YYYY') +
        '&until=' + this.time.endDate.format('DD.MM.YYYY'))
      : (this.year ? "&year=" + this.year : '');
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

  // Link builders
  createLatLonWithRadiusLink = (lat, lon, rad) => {
    return baseUrl + '/api/' + this.database +
      '/poly?type=circle&value=[' + lat + ',' + lon + ',' + rad + 'km]';
  };

  // Final builder
  fetchData = (link) => {
    return this.api.Get(link)
  };

  // Fetch region. Each method will reset controller
  getPack = (link) => {
    this.resetController()
    this._pack = true
    return this.fetchData(link);
  };

  getYears = () => { //Беремо просто роки
    this.resetController()
    let link = baseUrl + "/api/" + this.database + "/years?";
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

    let time = this.getTime();
    let link = this.polyRequest + time;
    console.log(link);
    if (time) {
      return this.fetchData(link);
    } else return [];
  };

  ChooseFromContext(context) {
    console.log(context);
    context.date && (this.time = context.date) || context.year && (this.year = context.year);

    this.polyRequest = context.polyRequest;
    this.markerRequest = context.markerRequest;

   console.log(this._time);

   let markerRequest;


    let isWeatherRequest = this.YieldsToWeatherRequest();

    if (context.isMarkerSelected && isWeatherRequest) {
      this.fetchData(this.markerRequest)
        .then((weather) => {
          context.setWeather(weather.response);
        }).catch((error) => console.log(error));

    } else if (context.isPolySelected && isWeatherRequest) {
      this.fetchData(this.polyRequest)
        .then((weather) => {
          context.setWeather(weather.response);
        }).catch((error) => console.log(error));

    } else if (context.isPolySelected || context.isMarkerSelected) {
      alert("Nothing to search...")
    }
    //Звичайний запит за типом і query.
    else {
      let neighbors, queryType, polyreq, limit, offset,
        searchType = context.selectedField;
      //Запит або Poly або вручну вбивали
      limit = context.limit || undefined;
      offset = context.offset || undefined;
      neighbors = context.neighbors;
      let names = context.queryParam;
      queryType = (names ? '&query=' + names : '');

      let queryValue = (polyreq ? polyreq : 'stations?field=' + searchType + queryType + neighbors);

      if (limit !== undefined) {
        queryValue += '&limit=' + limit
      }
      if (offset !== undefined) {
        queryValue += '&offset=' + offset
      }

      let stationRequest = baseUrl + '/api/gsod/' + queryValue;
      if (context.year || context.date.dateSet) {

        this.fetchData(stationRequest).then((station) => {
          this.props.onStationsData(station);

          this.props.api.fetchData(stationRequest + isWeatherRequest)
            .then((weather) => {
              this.props.setWeather(weather);
            })
            .catch((error) => {
              console.log(error)
            });
        }).catch((error) => {
          console.log(error)
        });


      } else {
        this.props.api.fetchData(stationRequest).then((station) => {
          this.props.onStationsData(station);
        })
      }
    }
  }

  getStationsCount() {
    return this.fetchData(baseUrl + "/api/gsod/countries/stationsCount")
  }
}
