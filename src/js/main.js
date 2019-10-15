import React, {Component} from 'react';
import $ from 'jquery';
import axios from 'axios';
import {mymap} from '../Main/Map/Components/Map';
import L from 'leaflet';
import WeatherControl from "../Main/Elements/WeatherControl";
import PageNav from '../Main/Controls/PageNavItem';
import Station from '../Main/Elements/StationTemplate';
import MapComponent from '../Main/Map/MapComponent'
import 'leaflet-selectareafeature';
import throttle from 'lodash/throttle';
import Nav from '../Main/NavbarTop';
import Loader from '../Main/Elements/AtomLoader';
import Containers from "../Main/Containers";
import CountCircle from '../Main/Elements/CountCircle';
import 'leaflet.pm';
import {baseUrl} from "../js/const"
import Footer from '../Main/Elements/Footer'
import {ApiController} from '../js/apicontroller'
import 'js/map_extensions'

const Typeahead = require('typeahead');

var base = baseUrl, markerGroup = null;

function genMaker(e, click, content, cnt, i) {
  return {position: e, click, content, id_cnt: cnt, data: i}
}

export function createStation(e, cnt, click) {
  return <Station click={click} key={cnt} id={cnt} props={e}/>;
}

function flatten(arr) {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten)
        ? flatten(toFlatten)
        : toFlatten);
  }, []);
}

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouse: {
        lat: null,
        lng: null
      },
      stationsAll: [],
      DownloadList: [],
      ctr_list: [],
      togglerSelect: false,
      markerGroup: null,
      isVisible: false,
      loadingProgress: 0,
      api: new ApiController(this.loadingStarted, this.loadingFinished, this.progressChanged),
      daysItems: [],
      currentSelected: [],
      SelTimeFun: null,
      stationsCounter: null,
      lockM: true,
    };

    this.onMarkerClick = throttle(this.onMarkerClickBase, 500)
  }

  componentDidMount() {
    this.setHandlers();
    this.setDocumentVars();
  }

  setDocumentVars = () => {
    const lx = window.location.search.substr(1);

    window.history.replaceState({}, "WeatherConsole", "/#!");
    $('[data-toggle="tooltip"]').tooltip();
    $('nav a').click((e) => {
      e.preventDefault();
    });

    //Invalid запит на /gsod/years
    /* this.state.api.getYears().done((data) => {
       Typeahead($("#years")[0], {source: data.response});
       $("#years").removeAttr('readonly');
     });*/

    // Можна було б здобути локацію пользоватєля і збросити його колишні запити станцій на його країну
    /* axios.get("https://ipinfo.io")
       .then((response) => {
         console.log("Your adress...");
         console.log(response.city, response.country);
       }).catch((error) => console.log(error));*/

    //Тут навєрно наварив
    //Можливо убери lx.includes('stations')
    if (lx.includes('stations') && !lx.includes('react_perf')) {
      //Будь-який запит на станцію
      axios.get(base + '/api/gsod/stations/?' + lx)
        .then((station) => {
          console.log(station);
          //І втулю йому свіжі погодні дані
          let date = new Date();
          let weatherLink = base + '/api/gsod/stations?' + lx + '&year='
            + date.getFullYear() + '&month=' + date.getMonth() + '&day=' + date.getDate();
          axios.get(weatherLink)
            .then((weather) => {
              console.log();
              if (station.data.response != null || weather.data.response != null) {
                this.setWeathItem(station.data.response[0], weather.data.response);
              }
            })
            .catch((error) => {
              console.log(error);
            })
        })
        .catch((error) => {
          console.log(error);
        })
    }
  };

  setWeathItem = (station, weather) => {
    console.log(station);
    let cnt = 0;
    //Чого тільки одна станція може бути
    this.setState({currentStation: createStation(station, 0, this.onStationClick)});

    this.setState({
      daysItems: weather.map((i) => {
        return this.creativeDay(i, cnt++);
      })
    })
  };

  creativeDay = (e, cnt) => {
    return <WeatherControl key={cnt} data={e}/>;
  };

  progressChanged = (amount) => {
    this.setState({loadingProgress: amount});
  };

  loadingStarted = () => {
    this.setState({isVisible: true});
  };

  loadingFinished = () => {
    setTimeout(this.setState, 900, {isVisible: false});
    setTimeout(this.setState, 2000, {loadingProgress: 0});
  };

  setMarkers = (e) => {
    this.setState({MapMarkers: e})
  };

  onStationClick = (e) => {
    this.setState({
      currentStation: createStation(e, 0, this.onStationClick)
    });
    this.getStationsData(e, 'circle', 1);
  };

  getStationsData = (t, type, radius) => {
    console.log("FUCK")
    console.log(t)
    let g = this.selTimeFun();
    let isYear = g.includes('year');
    isYear ? this.state.api.ofTimeExp(g) : this.state.api.ofRangeExp(g);

    let lat = t.lat;
    let lon = t.lon || t.lng; //

    this.state.api.getStationByLatLon(type, lat, lon, radius).then((station) => {
      console.log("Station");
      console.log(station);
      this.state.api.getWeathByLatLon(type, lat, lon, radius).then((weather) => {
        console.log("Weather!");
        console.log(weather);
        this.setWeathItem(station.response[0], weather.response);
      }).catch((error) => console.log(error))
    });
  };

  onMarkerClick() {
    this.onMarkerClick.cancel()
  }

  onMarkerClickBase = (e) => {
    const t = e.target.getLatLng();
    this.getStationsData(t, "circle", 1);
  };

  onStationsData = (station, lngs) => {
    this.setState({lockM: true});
    this.setState({stationsCounter: <CountCircle response={station}/>});
    if (station.code === 33) return;
    //Не понімаю.
    // const data = !resp.Item2 ? resp : resp.Item2; // hardcoded. maybe review API models
    const data = station;
    if (data.response && Array.isArray(data.response) && data.response[0].item) {
      data.response = flatten(data.response.map((e) => e.data));
    }
    if (markerGroup) mymap.removeLayer(markerGroup);
    markerGroup = L.layerGroup().addTo(mymap);
    let cnt = 0;
    let fx = Array.isArray(data.response) && data.response.filter((i) => {
      return i.lat && i.lon && i.lat !== '+00.000';
    });
    if (fx)
      this.setState({
        stationsAll: fx.map((i) => createStation(i, cnt++, this.onStationClick))
      });
    const markers = [], area_latlon = [];
    for (let o = 0; o < fx.length; o++) {
      let i = fx[o];
      let lt = L.latLng(i.lat, i.lon);
      area_latlon.push(lt);
      markers.push(genMaker(lt, this.onMarkerClick, createStation(i), o, i));
    }
    this.setMarkers(markers);
    mymap.fitBounds(L.latLngBounds(lngs || area_latlon));
  };

  /* createPageNavItem(name, full_href, href, cnt, active = false, disabled = false) {
     var hrefx = href
       ? href
       : full_href;
     return <PageNav href={hrefx} key={cnt} active={active} text={name} disabled={disabled} onClick={(e) => {
       e.preventDefault();
       this.getData(full_href);
       return false
     }}/>;
   }

   getData = (e) => {
     this.state.api.fetchData(e).then((data) => {
       this.setWeathItem(data);
     }).catch((error) => console.log(error))
   };*/

  setHandlers = () => {};

  onMapPageChanged = (e) => {
    if (this.state.lockM) {
      this.setState({lockM: false})
      return;
    }
    var t = e.map((r) => r.position);
    if (t.length > 0) {
      mymap.fitBounds(t);
    }
  };

  activeMarker = (e) => {
    console.log("Active: " + e.options.position)
  };

  onMouseMove = (e) => {
    return "lat: " + e.latlng.lat + " lng: " + e.latlng.lng; // wasn't applied
  };

  onStationsAndWeathersData = (station, weather) => {
    console.log("Get station and weather");
    /*const data = station;
    if (data.response && Array.isArray(data.response) && data.response[0].item) {
      data.response = flatten(data.response.map((e) => e.data));
    }
    if (markerGroup) mymap.removeLayer(markerGroup);
    markerGroup = L.layerGroup().addTo(mymap);
    let cnt = 0;
    let fx = Array.isArray(data.response) && data.response.filter((i) => {
      return i.lat && i.lon && i.lat !== '+00.000';
    });
    if (fx)
      this.setState({
        stationsAll: fx.map((i) => creativeSt(i, cnt++, this.onStationClick))
      });
    const markers = [], area_latlon = [];
    for (let o = 0; o < fx.length; o++) {
      let i = fx[o];
      let lt = L.latLng(i.lat, i.lon);
      area_latlon.push(lt);
      markers.push(genMaker(lt, this.onMarkerClick, creativeSt(i), o, i));
    }
    this.setMarkers(markers);
    mymap.fitBounds(L.latLngBounds(lngs || area_latlon));*/

    /* this.setState({
       daysItems: weather.map((i) => {
         return this.creativeDay(i, cnt++);
       })
     })*/
    //this.setState({DownloadList: e.response})
  };

  setCtrList = (list) => {
    this.setState({ctr_list: list})
  };

  selectedIndexChange = (e) => {
    this.setState({mapSelectedIndex: e})
  };

  onRefreshClick = () => {
    mymap.setView([
      48.289559, 31.3205566 // Ukraine centered
    ], 6);
    this.setMarkers([]);
    this.setState({lastPoly: []})
  };

  // Naming conflict -> refactor later
  SelTimeFun = (m) => {
    this.selTimeFun = m;
  };

  render() {
    let comp = {
      api: this.state.api,
      currentSelected: this.state.currentSelected,
      currentStation: this.state.currentStation,
      counter: this.state.stationsCounter,
      markers: this.state.MapMarkers,
      setCtrList: this.setCtrList,
      mapSelectedIndex: this.selectedIndexChange,
      OnPolySelected: this.props.OnPolySelected,
      onStationsAndWeathersData: this.onStationsAndWeathersData,
      onStationsData: this.onStationsData,
      activeMarker: this.activeMarker,
      PageChanged: this.onMapPageChanged,
      onMarkerClick: this.onMarkerClick,
      onRefreshClick: this.onRefreshClick,
      SelTime: this.SelTimeFun
    };

    let conts = {
      ctr_list: this.state.ctr_list,
      mapSelectedIndex: this.state.mapSelectedIndex,
      DownloadList: this.state.DownloadList,
      selectedStations: this.state.stationsAll,
      stations: this.state.stationsAll,
      daysItems: this.state.daysItems
    };

    return (<div className="container-fluid p-0">
      <Nav/>
      <MapComponent {...comp}/>
      <Loader progress={this.state.loadingProgress} isVisible={this.state.isVisible}/>
      <Containers {...conts}/>
      <Footer/>
    </div>)
  }
};

