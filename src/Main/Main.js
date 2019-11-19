import React, {Component} from 'react';
import {mymap} from './Map/Components/Map';
import {connect} from 'react-redux';
import L from 'leaflet';
import WeatherControl from "./Elements/WeatherControl";
import Station from './Elements/StationTemplate';
import MenuComponent from './Map/MenuComponent'
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
      api: new ApiController(this.loaderVisibility),
      daysItems: [],
      currentSelected: [],
      stationsCounter: null,
      lockM: true,
    };

    this.onMarkerClick = throttle(this.onMarkerClickBase, 500)
  }

  loaderVisibility = (flag) => {
    this.setState({isVisible: flag});
  };


  clearMap = () => {
    this.setState({
      MapMarkers: [],
      stationsAll: null,
      daysItems: []
    })
  };

  setMarkers = (e) => {
    this.setState({MapMarkers: e})
  };

  getOneStationData = (e) => {
    const {MarkerSelected, date, year} = this.props;

    let data = e;
    data.options = {};
    data.options.radius = 1;

    let req = this.state.api.createPolyRequest(data);
    MarkerSelected(req);

    this.state.api.getStationsFromMapEvent({e: data}).then((station) => {
      this.setCardItem(station.response[0]);
    }).catch((error) => console.log(error));

    if (date.dateSet || year)
      this.state.api.getWeatherFromMapEvent({e: data, time: date, year: year})
        .then((weather) => {
          this.setWeather(weather.response);
        }).catch((error) => console.log(error));

    // create link for user download
    this.state.api.getPackFromMapEvent({e: data, time: date, year: year, pack: true})
      .then((pack) => {
        this.props.setPackLink(pack);
      }).catch((error) => console.log(error));
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
    this.getOneStationData(e);
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

  //Якщо видаляється лише один полігон. Тут треба погратись
  onToolRemove = (event) => {
    this.setCardItem([]);
    this.clearMap();
    this.props.PolySelected("", false);
    this.props.MarkerSelected("");
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
      onToolRemove: this.onToolRemove,
      clearMap: this.clearMap,
      setCardItem: this.setCardItem
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
  year: state.dataReducer.year,
  date: state.dataReducer.date,
  lastPoly: state.dataReducer.lastPoly
});

const mapDispatchToProps = dispatch => ({
  PolySelected: (req, flag) => {
    dispatch({type: "IF_POLY_SELECTED", req: req, flag: flag})
  },
  MarkerSelected: (flag, req) => {
    dispatch({type: "IF_MARKER_SELECTED", req: req})
  },
  setPackLink: (link) => {
    dispatch({type: "SET_PACK_LINK", link: link})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
