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
      stationsAll: [],
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
      MapMarkers: [],
      polygons: []
    };

    this.onMarkerClick = throttle(this.onMarkerClickBase, 500)
  }

  loaderVisibility = (flag) => {
    this.setState({isVisible: flag});
  };

//Full clear
  clearMap = () => {
    this.setState({
      MapMarkers: [],
      stationsAll: [],
      daysItems: [],
      currentStation: null
    })
  };

  partialClear = (poly) => {
    let withoutRemovedMarkers = this.state.MapMarkers.filter((marker) => {
      return !poly.layer.contains(marker.position)
    });

    let withoutRemovedStations = this.state.stationsAll.filter((station) => {
      let LatLng = {lat: parseFloat(station.props.props.lat), lng: parseFloat(station.props.props.lon)};
      return !poly.layer.contains(LatLng)
    });

    console.log(this.state.stationsAll)
    console.log(this.state.daysItems)

    let withoutRemovedWeather = [];
    for (let i in withoutRemovedStations) {
      let existingWeather = this.state.daysItems.filter((weather) => {
        console.log(weather.props);
        console.log(this.state.stationsAll[i].props)
        return weather.props.data.uid === withoutRemovedStations[i].props.props.uid
      });
      Array.prototype.push.apply(withoutRemovedWeather, existingWeather);
    }

    console.log(this.state.daysItems)
    console.log(withoutRemovedWeather);


    this.setState({
      MapMarkers: withoutRemovedMarkers,
      stationsAll: withoutRemovedStations,
      daysItems: withoutRemovedWeather,
      currentStation: null
    })
  };

  beforeMove = (poly) => {
    console.log("All POLYS")
    console.log(this.state.polygons);
    let withoutOldPoly = this.state.polygons.filter((elem) => {
      return poly.layer !== elem.layer
    });
    console.log("withoutOldPoly")
    console.log(withoutOldPoly);
    this.setState({polygons: withoutOldPoly})
  };

  setMarkers = (newMarkers, currentPoly) => {
    let withNewPoly = [currentPoly];
    Array.prototype.push.apply(withNewPoly, this.state.polygons);
    this.setState({polygons: withNewPoly});
    //console.log(this.state.polygons);
    let prevMarkers = this.state.MapMarkers;

    console.log(this.state.polygons)

    let sortedMarkers = [];
    if (prevMarkers.length > 0) {
      for (let i in this.state.polygons) {
        let markersOfPoly = prevMarkers.filter((marker) => {
          {
            return this.state.polygons[i].layer.contains(marker.position);
          }
        });
        Array.prototype.push.apply(sortedMarkers, markersOfPoly);
      }
    }

    console.log("sortedMarkers");
    console.log(sortedMarkers);
    console.log("newMarkers");
    console.log(newMarkers);
    Array.prototype.push.apply(newMarkers, sortedMarkers);
    console.log("RESULT");
    console.log(newMarkers);

    this.setState({MapMarkers: newMarkers})
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

    this.state.api.getPackFromMapEvent({e: data, pack: true})
      .then((pack) => {
        this.props.setStationPackLink(pack.response[0]);
      }).catch((error) => console.log(error));

    if (date.dateSet || year) {
      this.state.api.getWeatherFromMapEvent({e: data, date: date, year: year})
        .then((weather) => {
          this.setWeather(weather.response);
        }).catch((error) => console.log(error));

      this.state.api.getPackFromMapEvent({e: data, date: date, year: year, pack: true})
        .then((pack) => {
          this.props.setWeatherPackLink(pack.response[0]);
        }).catch((error) => console.log(error));
    }
  };

  setCardItem = (station) => {
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
    console.log(e)
    this.getOneStationData(e);
  };

  onStationsData = (station, poly) => {
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

    let fx = Array.isArray(data.response) && data.response.filter((i) => {
      return i.lat && i.lon && i.lat !== '+00.000';
    });


    if (fx) {
      let cnt = this.state.stationsAll.length;
      let mrk = cnt;

      let withNewStations = fx.map((i) => createStation(i, cnt++, this.setCardItem));
      Array.prototype.push.apply(withNewStations, this.state.stationsAll);
      this.setState({
        stationsAll: withNewStations
      });

      const markers = [], area_latlon = [];
      for (let i = 0; i < fx.length; i++) {
        let location = fx[i];
        let coords = L.latLng(location.lat, location.lon);
        area_latlon.push(coords);
        markers.push(createMaker(coords, this.onMarkerClick, createStation(location), mrk++, location));
      }
      this.setMarkers(markers, poly);
      mymap.fitBounds(L.latLngBounds(area_latlon));
    } else alert("No data, sorry");
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
    this.partialClear(event);

    console.log(this.props.lastPoly);

    if (this.props.lastPoly.length === 0) {
      this.props.PolySelected("", false);
      this.props.MarkerSelected("");
    }
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
      setCardItem: this.setCardItem,
      beforeMove: this.beforeMove
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
  MarkerSelected: (req) => {
    dispatch({type: "IF_MARKER_SELECTED", req: req})
  },
  setStationPackLink: (link) => {
    dispatch({type: "SET_STATION_PACK_LINK", link: link})
  },
  setWeatherPackLink: (link) => {
    dispatch({type: "SET_WEATHER_PACK_LINK", link: link})
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
