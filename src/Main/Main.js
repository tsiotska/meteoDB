import React, { Component } from 'react';
import { mymap } from './Map/MapComponent';
import MapComponent from './Map/MapComponent';
import Sidebar from './Sidebar';
import { connect } from 'react-redux';
import L from 'leaflet';
import WeatherControl from "./Elements/WeatherControl";
import Station from './Elements/StationTemplate';
import StationsQueryComponent from './Menu/StationsQueryComponent'
import ConditionalContainer from './Containers/ConditionalContainer'
import StatisticsAggregationComponent from './Menu/StatisticsAggregationComponent'
import StationsResultView from './Menu/StationsResultView'
import WeatherAggregationComponent from './Menu/WeatherAggregationComponent'
import throttle from 'lodash/throttle';
import Loader from './Elements/AtomLoader';
import CountryList from './Containers/CountryList';
import DaysItemsList from './Containers/DaysItemsList';
import SelectedStationsList from './Containers/SelectedStationsList'
import CountCircle from './Elements/CountCircle';
import 'leaflet.pm';
import Footer from './Elements/Footer'
import { ApiController } from '../js/apicontroller'
import 'js/map_extensions'
import FlyoutContainer from "./Containers/FlyoutContainer"
import turf from 'turf';
import $ from "jquery";

var markerGroup = null;

function createMaker(e, click, content, cnt, i) {
  return { position: e, click, content, id_cnt: cnt, data: i }
}

export function createStation(e, cnt, click) {
  return <Station click={click} key={cnt} id={cnt} props={e} />;
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouse: {
        lat: null,
        lng: null
      },
      ctr_list: [],
      togglerSelect: false,
      markerGroup: null,
      isVisible: false,
      api: new ApiController(this.loaderVisibility),
      stationsCounter: null,
      lockM: true,
    };

    this.onMarkerClick = throttle(this.onMarkerClickBase, 500)
  }

  loaderVisibility = (flag) => {
    this.setState({ isVisible: flag });
  };

  conglameratePolygons = () => {
    const {polygons, setPolyPayload} = this.props;

    let geoPolygons = polygons.map((poly) => {
      return poly.layer.toGeoJSON()
    });

    let union;
    if (polygons.length > 1) {
      union = turf.union(...geoPolygons);
      union = JSON.stringify(union)
      setPolyPayload(union)
    } else {
      geoPolygons = JSON.stringify(geoPolygons)
      setPolyPayload(geoPolygons)
    }
  };

  partialClear = (poly) => {
    let withoutRemovedPolygon = this.props.polygons.filter((polygon) => {
      return polygon.layer._leaflet_id !== poly.layer._leaflet_id
    });
    this.props.setPolygons(withoutRemovedPolygon);

    let withoutRemovedMarkers = [], withoutRemovedStations = [], withoutRemovedWeather = [];
    for (let i in this.props.polygons) {
      let markersInOnePoly = this.props.markers.filter((marker) => {
        return this.props.polygons[i].layer.contains(marker.position)
          && !withoutRemovedMarkers.some((repeat) => repeat.data.id === marker.data.id)
      });
      Array.prototype.push.apply(withoutRemovedMarkers, markersInOnePoly);

      let stationsInOnePoly = this.props.stations.filter((station) => {
        let LatLng = { lat: parseFloat(station.props.props.lat), lng: parseFloat(station.props.props.lon) };
        return this.props.polygons[i].layer.contains(LatLng)
          && !withoutRemovedStations.some((repeat) => repeat.props.props.id === station.props.props.id)
      });
      Array.prototype.push.apply(withoutRemovedStations, stationsInOnePoly);
    }

    for (let i in withoutRemovedStations) {
      let existingWeather = this.props.weather.filter((weather) => {
        return weather.props.data.id === withoutRemovedStations[i].props.props.id
      });
      Array.prototype.push.apply(withoutRemovedWeather, existingWeather);
    }
    // can be simplified in one action
    this.props.setMarkersAndStations(withoutRemovedMarkers, withoutRemovedStations);
    this.props.setWeather(withoutRemovedWeather);
    this.props.setSelectedStation(null);
    this.conglameratePolygons();
  };

  beforeMove = (poly) => {
    let withoutOldPoly = this.props.polygons.filter((elem) => {
      return poly.layer._leaflet_id !== elem.layer._leaflet_id
    });
    this.props.setPolygons(withoutOldPoly)
  };

  onWeatherData = (weather) => {
    let wth = this.props.stations.length;
    let newWeather = weather.map((i) => {
      return this.creativeDay(i, wth++);
    });
    const sortedWeather = [], prevWeather = this.props.weather;

    if (prevWeather.length > 0) {
      for (let i in this.props.stations) {
        let weatherInOnePoly = prevWeather.filter((weather) => {
          return weather.props.data.id === this.props.stations[i].props.props.id;
        });
        Array.prototype.push.apply(sortedWeather, weatherInOnePoly);
      }
    }

    Array.prototype.push.apply(sortedWeather, newWeather);
    this.props.setWeather(sortedWeather)
  };

  setStationsAndMarkersInPoly = (currentPoly, newMarkers, newStations) => {
    console.log(currentPoly);
    console.log(this.props.polygons);

    let withoutRepeatingPoly = this.props.polygons.filter((poly) => {
      return poly.layer._leaflet_id !== currentPoly.layer._leaflet_id;
    });

    if (withoutRepeatingPoly.length === this.props.polygons.length) {
      console.log("New poly!")
      let withNewPoly = [];
      withNewPoly.push(currentPoly);
      Array.prototype.push.apply(withNewPoly, this.props.polygons);
      this.props.setPolygons(withNewPoly);
    } else {
      console.log("Old poly!")
      withoutRepeatingPoly.push(currentPoly);
      this.props.setPolygons(withoutRepeatingPoly);
    }
    console.log(this.props.polygons);
    this.conglameratePolygons();

    const sortedMarkers = [], prevMarkers = this.props.markers, sortedStations = [],
      prevStations = this.props.stations;

    if (this.props.stations.length > 0) {
      for (let i in this.props.polygons) {
        let markersInOnePoly = prevMarkers.filter((marker) => {
          return this.props.polygons[i].layer.contains(marker.position)
            && !newMarkers.some((newMarker) => newMarker.data.id === marker.data.id)
            && !sortedMarkers.some((oldMarker) => oldMarker.data.id === marker.data.id)
        });
        Array.prototype.push.apply(sortedMarkers, markersInOnePoly);

        let stationsInOnePoly = prevStations.filter((station) => {
          let LatLng = { lat: parseFloat(station.props.props.lat), lng: parseFloat(station.props.props.lon) };
          return this.props.polygons[i].layer.contains(LatLng)
            && !newStations.some((repeat) => repeat.props.props.id === station.props.props.id)
            && !sortedStations.some((oldStation) => oldStation.props.props.id === station.props.props.id)
        });
        Array.prototype.push.apply(sortedStations, stationsInOnePoly);
      }
    }
    Array.prototype.push.apply(sortedStations, newStations);
    Array.prototype.push.apply(sortedMarkers, newMarkers);

    this.props.setMarkersAndStations(sortedMarkers, sortedStations);
  };

  getOneStationData = (e) => {
    const {MarkerSelected} = this.props;

    let data = e;
    data.options = {};
    data.options.radius = 1;

    let req = this.state.api.createPolyRequest(data);
    MarkerSelected(req);

    this.state.api.getStationsFromMapEvent({ e: data }).then((station) => {
      this.setCardItem(station.response[0]);
    }).catch((error) => console.log(error));
  };

  setCardItem = (station) => {
    this.props.setSelectedStation(createStation(station, 0));
  };

  setWeatherForOneStation = (weather) => {
    let cnt = 0;
    this.props.setWeather(weather.map((i) => {
      return this.creativeDay(i, cnt++);
    }))
    /*this.setState({
      daysItems: weather.map((i) => {
        return this.creativeDay(i, cnt++);
      })
    })*/
  };

  creativeDay = (e, cnt) => {
    return <WeatherControl key={cnt} data={e} />;
  };

  onMarkerClick() {
    this.onMarkerClick.cancel()
  }

  onMarkerClickBase = (e) => {
    this.getOneStationData(e);
  };

  onStationsSelection = (station, poly) => {
    if (station.code === 33) return;

    let stations = Array.isArray(station.response) ? station.response.filter((i) => {
      return i.lat && i.lon;
    }) : null;

    if (stations) {
      let cnt, mrk;

      cnt = mrk = this.props.stations.length > 0 ? this.props.stations[this.props.stations.length - 1].key + 1 : 0;

      let newStations = stations.map((i) => createStation(i, cnt++, this.setCardItem));

      const newMarkers = [], area_latlon = [];
      for (let i = 0; i < stations.length; i++) {
        let location = stations[i];
        let coords = L.latLng(location.lat, location.lon);
        area_latlon.push(coords);
        newMarkers.push(createMaker(coords, this.onMarkerClick, createStation(location), mrk++, location));
      }

      if (poly) {
        this.setStationsAndMarkersInPoly(poly, newMarkers, newStations);
      } else {
        this.props.setMarkersAndStations(newMarkers, newStations);
      }
      mymap.fitBounds(L.latLngBounds(area_latlon).pad(.3));
    } else alert("No data, sorry");
  };

  onMapPageChanged = (e) => {
    if (this.state.lockM) {
      this.setState({ lockM: false });
      return;
    }
    let t = e.map((r) => r.position);
    if (t.length > 0) {
      mymap.fitBounds(t.pad(.3));
    }
  };

  activeMarker = (e) => {
    if($(e.target._icon).hasClass("coloredSelectedMarker")){
      $(e.target._icon).removeClass("coloredSelectedMarker")
        .addClass("coloredUnselectedMarker");
      this.props.setSelectedStation([]);
    } else {
      $('.leaflet-marker-icon').removeClass('coloredSelectedMarker')
        .addClass('coloredUnselectedMarker');
      $(e.target._icon).removeClass("coloredUnselectedMarker")
        .addClass("coloredSelectedMarker");
    }
  };

  onMouseMove = (e) => {
    return "lat: " + e.latlng.lat + " lng: " + e.latlng.lng; // wasn't applied
  };

  setCtrList = (list) => {
    this.setState({ ctr_list: list })
  };

  selectedIndexChange = (e) => {
    this.setState({ mapSelectedIndex: e })
  };


  onToolRemove = (event) => {
    this.partialClear(event);

    if (this.props.polygons.length === 0) {
      this.props.setPolyPayload("");
      this.props.MarkerSelected("");
    }
  };


  render() {
    let comp = {
      api: this.state.api,
      counter: this.state.stationsCounter,
      setCtrList: this.setCtrList,
      mapSelectedIndex: this.selectedIndexChange,
      setWeatherForOneStation: this.setWeatherForOneStation,
      onStationsSelection: this.onStationsSelection,
      activeMarker: this.activeMarker,
      PageChanged: this.onMapPageChanged,
      onMarkerClick: this.onMarkerClick,
      onToolRemove: this.onToolRemove,
      setCardItem: this.setCardItem,
      beforeMove: this.beforeMove,
      onWeatherData: this.onWeatherData
    };

    let conts = {
      ctr_list: this.state.ctr_list,
      mapSelectedIndex: this.state.mapSelectedIndex,
    };

    let containerInnerClass = "m-2";
    return (<div className="d-flex container-fluid p-0">
      {this.state.isVisible && <Loader isVisible={this.state.isVisible} />}
      <Sidebar>
        <FlyoutContainer title="Search stations" position="left" iconClassName="fa fa-search"
          containerInnerClass={containerInnerClass}>
          <StationsQueryComponent {...comp}  />
          <ConditionalContainer visibleWhen={this.props.stations.length > 0}>
            <StationsResultView />
          </ConditionalContainer>
        </FlyoutContainer>

        <FlyoutContainer title="Aggregate weather" position="left" iconClassName="fa fa-filter"
          isVisible={this.props.stations.length > 0}
          containerInnerClass={containerInnerClass}>
          <WeatherAggregationComponent {...comp} />
          <ConditionalContainer visibleWhen={this.props.weather.length > 0}>
            <StatisticsAggregationComponent className={containerInnerClass} />
          </ConditionalContainer>
        </FlyoutContainer>

        <FlyoutContainer title="Countries" position="left" iconClassName="fa fa-globe"
          containerInnerClass={containerInnerClass}>
          <CountryList ctr_list={conts.ctr_list} />
        </FlyoutContainer>

        <FlyoutContainer title="Results" position="left" iconClassName="fa fa-sun-o">
          <DaysItemsList />
        </FlyoutContainer>
      </Sidebar>

      <MapComponent api={comp.api} onWeatherData={comp.onWeatherData}
        activeMarker={comp.activeMarker}
        onStationsSelection={comp.onStationsSelection}
        setCardItem={comp.setCardItem} onToolRemove={comp.onToolRemove}
        beforeMove={comp.beforeMove} />
      <Footer />
    </div>)
  }
}

const mapStateToProps = state => ({
  years: state.dataReducer.years,
  date: state.dataReducer.date,
  polygons: state.dataReducer.polygons,
  stations: state.dataReducer.stations,
  weather: state.dataReducer.weather,
  markers: state.dataReducer.markers,
  selectedStation: state.dataReducer.selectedStation
});

const mapDispatchToProps = dispatch => ({
  setPolyPayload: (req) => {
    dispatch({type: "SET_POLY_REQUEST", req: req})
  },
  MarkerSelected: (req) => {
    dispatch({type: "SET_MARKER_REQUEST", req: req})
  },
  setStationPackLink: (link) => {
    dispatch({type: "SET_STATION_PACK_LINK", link: link})
  },
  setWeatherPackLink: (link) => {
    dispatch({type: "SET_WEATHER_PACK_LINK", link: link})
  },
  setPolygons: (polygons) => {
    dispatch({type: "SET_POLYGONS", polygons: polygons})
  },
  setWeather: (weather) => {
    dispatch({type: "SET_WEATHER", weather: weather})
  },
  setMarkersAndStations: (markers, stations) => {
    dispatch({type: "SET_MARKERS_AND_STATIONS", markers: markers, stations: stations})
  },
  setSelectedStation: (selected) => {
    dispatch({type: "SET_SELECTED_STATION", selected: selected})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
