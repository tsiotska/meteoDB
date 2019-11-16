import {baseUrl} from "../js/const"
import FetchController from "../js/Helpers/FetchController";

export class ApiController {
  constructor(loaderVisibility) {
    this.api = new FetchController(loaderVisibility)
    this.database = "gsod"
    this.resetController()
  }

  resetController = () => {
    this._time =
      this._offset =
        this._limit =
          this._year =
            this._pack =
              this._nearest =
                this._hasNeighbours = null;
  }

  YieldsToWeatherRequest = () => this.year || this.time;

  // Getters & setters
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

  // Fluent api region
  withYear = (value) => {
    this._time = null;
    this._year = value;
    return this;
  }

  withNeighbors = (value) => {
    this._hasNeighbours = value;
    return this;
  }

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

  addTime = () => {
    return this._time
      ? ('&since=' + this._time.startDate.format('DD.MM.YYYY') +
        '&until=' + this._time.endDate.format('DD.MM.YYYY'))
      : (this._year ? "&year=" + this._year : '');
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
  }


  // Final builder
  fetchData = (link) => {
    return this.api.Get(
      link +
      this.addLimiters() +
      this.addNearestStations() +
      this.addNeighbours() +
      this.addTime() +
      this.addStatistics() +
      this.addPack());
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

  fromMapEvent(e) {
    console.log(e);

    let req = "", lngs = null;

    // TODO : build request from map
    // create circle or poly request
    if (e.options.radius !== undefined) {
      let res = [e._latlng.lat, e._latlng.lng, e.getRadius()/1000 + 'km'];
      req = baseUrl + '/api/' + this.database + '/poly?type=circle&value=[' + res + ']';
    } else {
      lngs = e._latlngs;
      req = baseUrl + '/api/' + this.database + '/poly?type=poly&value=[' + lngs.join('],[') + ']';
    }
    return this.fetchData(req);
  }

  getStationsCount() {
    return this.fetchData(baseUrl + "/api/gsod/countries/stationsCount")
  }

  ChooseFromContext(context) {
    let isWeatherRequest = this.YieldsToWeatherRequest();

    if (this.props.isMarkerSelected && isWeatherRequest) {

      this.fetchData(this.state.markerRequest + isWeatherRequest)
        .then((weather) => {
          context.setWeather(weather.response);
        }).catch((error) => console.log(error));

    } else if (this.props.isPolySelected && isWeatherRequest) {

      this.fetchData(this.state.polyRequest + isWeatherRequest)
        .then((weather) => {
          context.setWeather(weather.response);
        }).catch((error) => console.log(error));

    } else if (this.props.isPolySelected || this.props.isMarkerSelected) {
      alert("Nothing to search...")
    }
    //Звичайний запит за типом і query.
    else {
      let neighbors, queryType, polyreq, limit, offset,
        searchType = this.selectorByField.current.value;
      //Запит або Poly або вручну вбивали
      limit = this.state.limit || undefined;
      offset = this.state.offset || undefined;
      neighbors = context.neighbors;
      let names = this.state.queryParam;
      queryType = (names ? '&query=' + names : '');


      let queryValue = (polyreq ? polyreq : 'stations?field=' + searchType + queryType + neighbors);

      if (limit !== undefined) {
        queryValue += '&limit=' + limit
      } //offset може бути і без ліміта.
      if (offset !== undefined) {
        queryValue += '&offset=' + offset
      }

      let stationRequest = baseUrl + '/api/gsod/' + queryValue;
      if (/* yearTime || */ this.state.date.dateSet) { //Якщо є час, то потрібна і погода!

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


  // IT'S WRONG - we can't do it in this way
  // THIS REQUESTS WILL FETCH DATA FOR ALL STATIONS

  /*  getByTypeAndYear = (year, type) => {
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
  */

}
