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
// import Containers from "./Containers";
import Map from './Map/Components/Map';
import CountryList from './Containers/CountryList';
import DaysItemsList from './Containers/DaysItemsList';
import SelectedStationsList from './Containers/SelectedStationsList'
import CountCircle from './Elements/CountCircle';
import 'leaflet.pm';
import Footer from './Elements/Footer'
import {ApiController} from '../js/apicontroller'
import 'js/map_extensions'
import FlyoutContainer from "./Containers/FlyoutContainer"

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
      selectedPage: []
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

      let withoutRemovedPolygon = this.props.polygons.filter((polygon) => {
        return polygon.layer._leaflet_id !== poly.layer._leaflet_id
      });
      this.props.setPolygons (withoutRemovedPolygon);

      // && !newMarkers.some((newMarker) => newMarker.data.id === marker.data.id)

      let withoutRemovedMarkers = [], withoutRemovedStations = [], withoutRemovedWeather = [];
      for (let i in this.props.polygons) {
        let markersInOnePoly = this.state.MapMarkers.filter((marker) => {
          return this.props.polygons[i].layer.contains(marker.position)
            && !withoutRemovedMarkers.some((repeat) => repeat.data.id === marker.data.id)
        });
        Array.prototype.push.apply(withoutRemovedMarkers, markersInOnePoly);


        let stationsInOnePoly = this.state.stationsAll.filter((station) => {
          let LatLng = {lat: parseFloat(station.props.props.lat), lng: parseFloat(station.props.props.lon)};
          return this.props.polygons[i].layer.contains(LatLng)
            && !withoutRemovedStations.some((repeat) => repeat.props.props.id === station.props.props.id)
        });
        Array.prototype.push.apply(withoutRemovedStations, stationsInOnePoly);
      }

      console.log(withoutRemovedStations)
      console.log(this.state.daysItems)

      for (let i in withoutRemovedStations) {
        console.log("ITERATION!")
        let existingWeather = this.state.daysItems.filter((weather) => {

          return weather.props.data.id === withoutRemovedStations[i].props.props.id
        });
        Array.prototype.push.apply(withoutRemovedWeather, existingWeather);
      }

      this.setState({
        MapMarkers: withoutRemovedMarkers,
        stationsAll: withoutRemovedStations,
        daysItems: withoutRemovedWeather,
        currentStation: null
      })
  };

  beforeMove = (poly) => {
    let withoutOldPoly = this.props.polygons.filter((elem) => {
      return poly.layer._leaflet_id !== elem.layer._leaflet_id
    });
    // console.log(this.props.polygons)
    // console.log(withoutOldPoly)
    this.props.setPolygons(withoutOldPoly)
  };

  setMarkers = (newMarkers, currentPoly) => {
    // console.log(this.props.polygons)
    //Повертаємо полігони, якщо новий currentPoly це не старий який редагують
    console.log(this.props.polygons)
    let withoutRepeatingPoly = this.props.polygons.filter((poly) => {
      return poly.layer._leaflet_id !== currentPoly.layer._leaflet_id;
    });

    console.log(withoutRepeatingPoly)
//Добавляємо якщо він новий і обновляємо
    if (withoutRepeatingPoly.length === this.props.polygons.length) {
      console.log("This is new Polygon!")
      let withNewPoly = [];
      withNewPoly.push(currentPoly);
      Array.prototype.push.apply(withNewPoly, this.props.polygons);
      this.props.setPolygons(withNewPoly);
      //console.log(this.props.polygons)
    } else {
      console.log("This is old Polygon!");
      withoutRepeatingPoly.push(currentPoly);
      this.props.setPolygons(withoutRepeatingPoly);
      // console.log(this.props.polygons)
    }
    let prevMarkers = this.state.MapMarkers;

//Чи колишні маркери входять в наш полігон
    let sortedMarkers = [];

    if (prevMarkers.length > 0) {
      for (let i in this.props.polygons) {

        let markersOfPoly = prevMarkers.filter((marker) => {
          {
            return this.props.polygons[i].layer.contains(marker.position)
              && !newMarkers.some((newMarker) => newMarker.data.id === marker.data.id)
          }
        });
        Array.prototype.push.apply(sortedMarkers, markersOfPoly);
      }
      Array.prototype.push.apply(sortedMarkers, newMarkers);
    } else {
      sortedMarkers = newMarkers;
    }
    console.log(sortedMarkers);
    this.setState({MapMarkers: sortedMarkers})
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
      mymap.fitBounds(L.latLngBounds(area_latlon).pad(.3));
    } else alert("No data, sorry");
  };

  onMapPageChanged = (e) => {
    if (this.state.lockM) {
      this.setState({lockM: false});
      return;
    }
    let t = e.map((r) => r.position);
    if (t.length > 0) {
      mymap.fitBounds(t.pad(.3));
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


  onToolRemove = (event) => {
    this.partialClear(event);

    if (this.props.polygons.length === 0) {
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
      beforeMove: this.beforeMove,
      onCutRemove: this.onCutRemove
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
      {this.state.isVisible && <Loader isVisible={this.state.isVisible}/>}

      <Map setWeather={comp.setWeather} api={comp.api}
           activeMarker={comp.activeMarker}
           onStationsData={comp.onStationsData} markers={this.state.selectedPage}
           currentSelected={comp.markers}
           setCardItem={comp.setCardItem} onToolRemove={comp.onToolRemove}
           beforeMove={comp.beforeMove} onCutRemove={comp.onCutRemove}/>

      <FlyoutContainer title="Search">
        <MenuComponent {...comp} />
      </FlyoutContainer>

      <FlyoutContainer position="left" title="Countries">
        <CountryList ctr_list={conts.ctr_list}/>
      </FlyoutContainer>

      <FlyoutContainer position="right" title="Stations">
        <SelectedStationsList
          onStationsChange={conts.onStationsChange}
          index={conts.mapSelectedIndex}
          selectedStations={conts.selectedStations}/>
      </FlyoutContainer>

      <FlyoutContainer position="bottom" title="Weather">
        <DaysItemsList
          selectedPage={this.state.selectedPage}
          daysItems={conts.daysItems}/>
      </FlyoutContainer>

      {/* <Containers {...conts} /> */}
      <Footer/>
    </div>)
  }
}

const
  mapStateToProps = state => ({
    years: state.dataReducer.years,
    date: state.dataReducer.date,
    polygons: state.dataReducer.polygons
  });

const
  mapDispatchToProps = dispatch => ({
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
    setPolygons: (polygons) => {
      dispatch({type: "SET_POLYGONS", polygons: polygons})
    }
  });

export default connect(mapStateToProps, mapDispatchToProps)(Main);
