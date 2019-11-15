import {baseUrl} from "../js/const"
import FetchController from "../js/Helpers/FetchController";

export class ApiController {
  constructor(loaderVisibility) {
    this.api = new FetchController(loaderVisibility);
    this._time = this._year = null;
    this.database = "gsod";
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

  createLatLonWithRadiusLink = (type,lat,lon,rad)=>{ 
    // TODO: Polygon does not have radius!!!
    return baseUrl + '/api/' + this.database + '/poly?type=' + type +
     '&value=[' + lat + ',' + lon + ',' + rad + 'km]';
  }
  getStationByLatLon = (type, lat, lon, rad) => { 
    return this.fetchData(this.createLatLonWithRadiusLink(type,lat,lon,rad)) 
  };

  getWeathByLatLon = (type, lat, lon, rad) => {
    //TODO: append date
    return this.fetchData(this.createLatLonWithRadiusLink(type,lat,lon,rad) )
  }
  
  getTimeAmplifiers(state) {
    return  state.date.dateSet
      ? ('&since=' + state.date.startDate.format('DD.MM.YYYY') +
       '&until=' + state.date.endDate.format('DD.MM.YYYY'))
      : (state.year ? "&year=" + state.year : '');
  }

  fromMapEvent(e){
    let req = "", lngs = null;

    // create circle or poly request
    if (e.options.radius !== undefined) {
      let res = [e._latlng.lat, e._latlng.lng, e.getRadius() / 1000];
      req = baseUrl + '/api/'+this.database+'/poly?type=circle&value=[' + res + "km" + ']';
    } else {
      lngs = e._latlngs;
      req = baseUrl + '/api/'+this.database+'/poly?type=poly&value=[' + lngs.join('],[') + ']';
    }



  }
  getStationsCount(){
    return this.fetchData(baseUrl + "/api/gsod/countries/stationsCount")
  }
  WithOptions(options){
    if(options.locations){

    }

    if (options.year || options.date){
      // fetching weather data
      
    }
  }

  //extractors

  // IT'S WRONG - we can't do it in this way
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
  // old api
  /*getStationsIdsForYear = (year) => {
    let link = baseUrl + "/api/" + this.database + "/stations?limit=3&year=" + year;
    return this.fetchData(link)
  };*/

  /* getForWban = (id, wban) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + "&wban=" + wban + this.year;
    return this.fetchData(link)
  };

  getForId = (id) => {
    let link = baseUrl + "/api/" + this.database + "/db?id=" + id + this.year;
    return this.fetchData(link)
  } */

}
