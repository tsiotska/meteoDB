import React, {Component} from 'react';
import {mymap} from './Map/Components/Map';
import {connect} from 'react-redux';
import L from 'leaflet';
import WeatherControl from "./Elements/WeatherControl";
import Station from './Elements/StationTemplate';
import MenuComponent from './Map/MenuComponent'
import 'leaflet-selectareafeature';
import throttle from 'lodash/throttle';
import Nav from './NavbarTop';
import Loader from './Elements/AtomLoader';
import Containers from "./Containers";
import CountCircle from './Elements/CountCircle';
import 'leaflet.pm';
import Footer from './Elements/Footer'
import {ApiController} from '../js/apicontroller'
import 'js/map_extensions'


var markerGroup = null;

function createMaker(e, click, content, cnt, i) {
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

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouse: {
        lat: null,
        lng: null
      },
      stationsAll: null,
      DownloadList: [],
      ctr_list: [],
      togglerSelect: false,
      markerGroup: null,
      isVisible: false,
      //loadingProgress: 0,
      api: new ApiController(this.loaderVisibility),
      daysItems: [],
      currentSelected: [],
      stationsCounter: null,
      lockM: true,
      readyToDownload: false
    };

    this.onMarkerClick = throttle(this.onMarkerClickBase, 500)
  }

  //Цю функцію в рєдакс не прокинеш
  loaderVisibility = (flag) => {
    this.setState({isVisible: flag});
  };


  clearMarkers = () => {
    this.setState({
      MapMarkers: [],
      stationsAll: null
    })
  };

  setMarkers = (e) => {
    this.setState({MapMarkers: e})
  };

  checkTime = () => {
    let time = this.state.api.time;
    console.log(time);
    let isYear = time.includes('year');
    isYear ? this.state.api.withYear(time) : this.state.api.withTimeRange(time);
    return time;
    //this.state.api.YieldsToWeatherRequest
  };

  getOneStationData = (location, radius) => {
    this.props.MarkerSelected(true);

    radius = radius || 1;
    let lat = location.lat;
    let lon = location.lon || location.lng;

    this.state.api.getStationByLatLon(lat, lon, radius).then((station) => {
      let time = this.checkTime();
      if (time) {
        this.state.api.getWeatherByLatLon(lat, lon, radius).then((weather) => {
          this.setCardItem(station.response[0]);
          console.log(weather);
          this.setWeather(weather.response);
        }).catch((error) => console.log(error))
      } else {
        this.setCardItem(station.response[0]);
      }
    });

    // create link for user download
    this.fetchFileDownloadLink(
      this.state.api.createLatLonWithRadiusLink(lat, lon, radius));
  };

  fetchFileDownloadLink = (link) => {
    this.state.api.getPack(link).then((data) => {
      this.setState({packLink: data.response[0]});
    }).catch((error) => console.log(error));
    this.setState({readyToDownload: true})
  };

  setCardItem = (station) => {
    console.log(station);
    this.setState({currentStation: createStation(station, 0)});
  };

  setWeather = (weather) => {
    console.log(weather);
    let cnt = 0;
    this.setState({
      daysItems: weather.map((i) => {
        return this.creativeDay(i, cnt++);
      })
    })
  };

  creativeDay = (e, cnt) => {
    return <WeatherControl key={cnt} data={e}/>;
  };

  onMarkerClick() {
    this.onMarkerClick.cancel()
  }

  onMarkerClickBase = (e) => {
    this.getOneStationData(e.target.getLatLng(), 1);
  };

  onStationsData = (station) => {
    this.setState({lockM: true});
    this.setState({stationsCounter: <CountCircle response={station}/>});
    if (station.code === 33)
      return; // not found
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
        stationsAll: fx.map((i) => createStation(i, cnt++))
      });
    const markers = [], area_latlon = [];
    for (let i = 0; i < fx.length; i++) {
      let location = fx[i];
      let coords = L.latLng(location.lat, location.lon);
      area_latlon.push(coords);
      markers.push(createMaker(coords, this.onMarkerClick, createStation(location), i, location));
    }
    this.setMarkers(markers);

    mymap.fitBounds(L.latLngBounds(area_latlon));
  };

  clearWeather = () => {
    this.setState({
      daysItems: []
    })
  };

  onMapPageChanged = (e) => {
    if (this.state.lockM) {
      this.setState({lockM: false});
      return;
    }
    let t = e.map((r) => r.position);
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

  render() {
    let comp = {
      api: this.state.api,
      currentSelected: this.state.currentSelected,
      currentStation: this.state.currentStation,
      counter: this.state.stationsCounter,
      markers: this.state.MapMarkers,
      setCtrList: this.setCtrList,
      mapSelectedIndex: this.selectedIndexChange,
      setWeather: this.setWeather,
      onStationsData: this.onStationsData,
      activeMarker: this.activeMarker,
      PageChanged: this.onMapPageChanged,
      onMarkerClick: this.onMarkerClick,
      onRefreshClick: this.onRefreshClick,
      createPackLink: this.fetchFileDownloadLink,
      packLink: this.state.packLink,
      readyToDownload: this.state.readyToDownload,
      clearMarkers: this.clearMarkers,
      setCardItem: this.setCardItem,
      clearWeather: this.clearWeather
    };

    let conts = {
      ctr_list: this.state.ctr_list,
      mapSelectedIndex: this.state.mapSelectedIndex,
      DownloadList: this.state.DownloadList,
      selectedStations: this.state.stationsAll,
      stations: this.state.stationsAll,
      daysItems: this.state.daysItems,
    };

    return (<div className="container-fluid p-0">
      <Nav/>
      <MenuComponent {...comp} />
      {this.state.isVisible && <Loader isVisible={this.state.isVisible}/>}
      <Containers {...conts}/>
      <Footer/>
    </div>)
  }
}

const mapStateToProps = state => ({
  isMarkerSelected: state.conditionReducer.isMarkerSelected
});

const mapDispatchToProps = dispatch => ({
  MarkerSelected: (flag, req) => {
    dispatch({type: "IF_MARKER_SELECTED", flag: flag, req: req})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
