import React, { Component } from 'react';
import { mymap } from './Map/MapComponent';
import MapComponent from './Map/MapComponent';
import Sidebar from './Sidebar';
import { connect } from 'react-redux';
import L from 'leaflet';
import WeatherControl from "./Elements/WeatherControl";
import Station from './Elements/StationTemplate';
import StationsQueryComponent from './Menu/StationsQueryComponent'
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

var markerGroup = null;

function createMaker(e, click, content, cnt, i) {
  return { position: e, click, content, id_cnt: cnt, data: i }
}

export function createStation(e, cnt, click) {
  return <Station click={click} key={cnt} id={cnt} props={e} />;
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
    this.setState({ isVisible: flag });
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

  conglameratePolygons = () => {
    const { polygons, setPolygonsInGeo } = this.props;
    let geoPolygons = polygons.map((poly) => {
      return poly.layer.toGeoJSON()
    });

    let union;
    if (polygons.length > 1) {
      union = turf.union(...geoPolygons);
      console.log(union)
      setPolygonsInGeo(union)
    } else {
      setPolygonsInGeo(geoPolygons)
    }

  };


  partialClear = (poly) => {
    let withoutRemovedPolygon = this.props.polygons.filter((polygon) => {
      return polygon.layer._leaflet_id !== poly.layer._leaflet_id
    });
    this.props.setPolygons(withoutRemovedPolygon);

    let withoutRemovedMarkers = [], withoutRemovedStations = [], withoutRemovedWeather = [];
    for (let i in this.props.polygons) {
      let markersInOnePoly = this.state.MapMarkers.filter((marker) => {
        return this.props.polygons[i].layer.contains(marker.position)
          && !withoutRemovedMarkers.some((repeat) => repeat.data.id === marker.data.id)
      });
      Array.prototype.push.apply(withoutRemovedMarkers, markersInOnePoly);

      let stationsInOnePoly = this.state.stationsAll.filter((station) => {
        let LatLng = { lat: parseFloat(station.props.props.lat), lng: parseFloat(station.props.props.lon) };
        return this.props.polygons[i].layer.contains(LatLng)
          && !withoutRemovedStations.some((repeat) => repeat.props.props.id === station.props.props.id)
      });
      Array.prototype.push.apply(withoutRemovedStations, stationsInOnePoly);
    }
    console.log(withoutRemovedStations)
    for (let i in withoutRemovedStations) {
      let existingWeather = this.state.daysItems.filter((weather) => {
        return weather.props.data.id === withoutRemovedStations[i].props.props.id
      });
      Array.prototype.push.apply(withoutRemovedWeather, existingWeather);
    }

    console.log(withoutRemovedWeather)

    this.setState({
      MapMarkers: withoutRemovedMarkers,
      stationsAll: withoutRemovedStations,
      daysItems: withoutRemovedWeather,
      currentStation: null
    });
  };

  beforeMove = (poly) => {
    let withoutOldPoly = this.props.polygons.filter((elem) => {
      return poly.layer._leaflet_id !== elem.layer._leaflet_id
    });
    this.props.setPolygons(withoutOldPoly)
  };

  onWeatherData = (weather) => {
    let wth = this.state.stationsAll.length;
    let newWeather = weather.map((i) => {
      return this.creativeDay(i, wth++);
    });
    const sortedWeather = [], prevWeather = this.state.daysItems;
    for (let i in this.state.stationsAll) {
      let weatherInOnePoly = prevWeather.filter((weather) => {
        return weather.props.data.id === this.state.stationsAll[i].props.props.id;
      });
      Array.prototype.push.apply(sortedWeather, weatherInOnePoly);
    }
    Array.prototype.push.apply(sortedWeather, newWeather);
    this.setState({ daysItems: sortedWeather })
  };

  setStationsAndMarkers = (currentPoly, newMarkers, newStations) => {
    let withoutRepeatingPoly = this.props.polygons.filter((poly) => {
      return poly.layer._leaflet_id !== currentPoly.layer._leaflet_id;
    });

    if (withoutRepeatingPoly.length === this.props.polygons.length) {
      let withNewPoly = [];
      withNewPoly.push(currentPoly);
      Array.prototype.push.apply(withNewPoly, this.props.polygons);
      this.props.setPolygons(withNewPoly);
    } else {
      withoutRepeatingPoly.push(currentPoly);
      this.props.setPolygons(withoutRepeatingPoly);
    }
    this.conglameratePolygons();


    const sortedMarkers = [], prevMarkers = this.state.MapMarkers, sortedStations = [],
      prevStations = this.state.stationsAll;

    if (prevMarkers.length > 0) {
      for (let i in this.props.polygons) {
        let markersInOnePoly = prevMarkers.filter((marker) => {
          return this.props.polygons[i].layer.contains(marker.position)
            && !newMarkers.some((newMarker) => newMarker.data.id === marker.data.id)
        });
        Array.prototype.push.apply(sortedMarkers, markersInOnePoly);

        let stationsInOnePoly = prevStations.filter((station) => {
          let LatLng = { lat: parseFloat(station.props.props.lat), lng: parseFloat(station.props.props.lon) };
          return this.props.polygons[i].layer.contains(LatLng)
            && !newStations.some((repeat) => repeat.props.props.id === station.props.props.id)
        });
        Array.prototype.push.apply(sortedStations, stationsInOnePoly);
      }
    }

    Array.prototype.push.apply(sortedMarkers, newMarkers);
    Array.prototype.push.apply(sortedStations, newStations);
    this.setState({
      MapMarkers: sortedMarkers,
      stationsAll: sortedStations
    })
  };

  getOneStationData = (e) => {
    const { MarkerSelected, date, year } = this.props;

    let data = e;
    data.options = {};
    data.options.radius = 1;

    let req = this.state.api.createPolyRequest(data);
    MarkerSelected(req);

    this.state.api.getStationsFromMapEvent({ e: data }).then((station) => {
      this.setCardItem(station.response[0]);
    }).catch((error) => console.log(error));

    this.state.api.getPackFromMapEvent({ e: data, pack: true })
      .then((pack) => {
        this.props.setStationPackLink(pack.response[0]);
      }).catch((error) => console.log(error));

    if (date.dateSet || year) {
      this.state.api.getWeatherFromMapEvent({ e: data, date: date, year: year })
        .then((weather) => {
          this.setWeatherForOneStation(weather.response);
        }).catch((error) => console.log(error));

      this.state.api.getPackFromMapEvent({ e: data, date: date, year: year, pack: true })
        .then((pack) => {
          this.props.setWeatherPackLink(pack.response[0]);
        }).catch((error) => console.log(error));
    }
  };

  setCardItem = (station) => {
    this.setState({ currentStation: createStation(station, 0) });
  };

  setWeatherForOneStation = (weather) => {
    let cnt = 0;
    this.setState({
      daysItems: weather.map((i) => {
        return this.creativeDay(i, cnt++);
      })
    })
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


  onStationsData = (poly, station) => {
    this.setState({ lockM: true });
    this.setState({ stationsCounter: <CountCircle response={station} /> });
    if (station.code === 33)
      return; // not found

    const data = station;

    if (data.response && Array.isArray(data.response) && data.response[0].item) {
      data.response = flatten(data.response.map((e) => e.data));
    }

    if (markerGroup) mymap.removeLayer(markerGroup);
    markerGroup = L.layerGroup().addTo(mymap);

    let stations = Array.isArray(data.response) && data.response.filter((i) => {
      return i.lat && i.lon;
    });

    if (stations) {
      let cnt, mrk;
      cnt = mrk = this.state.stationsAll.length;
      let newStations = stations.map((i) => createStation(i, cnt++, this.setCardItem));

      const newMarkers = [], area_latlon = [];
      for (let i = 0; i < stations.length; i++) {
        let location = stations[i];
        let coords = L.latLng(location.lat, location.lon);
        area_latlon.push(coords);
        newMarkers.push(createMaker(coords, this.onMarkerClick, createStation(location), mrk++, location));
      }

      this.setStationsAndMarkers(poly, newMarkers, newStations);
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
    console.log("Active: " + e.options.position)
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
      this.props.PolyRequest("");
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
      setWeatherForOneStation: this.setWeatherForOneStation,
      onStationsData: this.onStationsData,
      activeMarker: this.activeMarker,
      PageChanged: this.onMapPageChanged,
      onMarkerClick: this.onMarkerClick,
      onToolRemove: this.onToolRemove,
      clearMap: this.clearMap,
      setCardItem: this.setCardItem,
      beforeMove: this.beforeMove,
      onWeatherData: this.onWeatherData
    };

    let conts = {
      ctr_list: this.state.ctr_list,
      mapSelectedIndex: this.state.mapSelectedIndex,
      DownloadList: this.state.DownloadList,
      selectedStations: this.state.stationsAll,
      stations: this.state.stationsAll,
      daysItems: this.state.daysItems,
    };
    let containerInnerClass = "m-2";
    return (<div className="d-flex container-fluid p-0">
      {this.state.isVisible && <Loader isVisible={this.state.isVisible} />}
      <Sidebar >
        <FlyoutContainer title="Search stations" position="left" iconClassName="fa fa-search" containerInnerClass={containerInnerClass}>
          <StationsQueryComponent {...comp}  />
          <StationsResultView   />
        </FlyoutContainer>

        <FlyoutContainer title="Aggregate weather" position="left" iconClassName="fa fa-filter" containerInnerClass={containerInnerClass}>
          <WeatherAggregationComponent {...comp} />
          <StatisticsAggregationComponent/>
        </FlyoutContainer>

        <FlyoutContainer title="Countries" position="left" iconClassName="fa fa-globe" containerInnerClass={containerInnerClass}>
          <CountryList ctr_list={conts.ctr_list} />
        </FlyoutContainer>

        <FlyoutContainer title="Stations by country" position="left" iconClassName="fa fa-map-marker" containerInnerClass={containerInnerClass}>
          <SelectedStationsList
            onStationsChange={conts.onStationsChange}
            index={conts.mapSelectedIndex}
            selectedStations={conts.selectedStations} />
        </FlyoutContainer>

        <FlyoutContainer title="Results" position="left" iconClassName="fa fa-sun-o">
          <DaysItemsList
            daysItems={conts.daysItems} />
        </FlyoutContainer>
      </Sidebar>

      <MapComponent api={comp.api} onWeatherData={comp.onWeatherData}
        activeMarker={comp.activeMarker}
        onStationsData={comp.onStationsData} markers={this.state.selectedPage}
        currentSelected={comp.markers}
        setCardItem={comp.setCardItem} onToolRemove={comp.onToolRemove}
        beforeMove={comp.beforeMove} onCutRemove={comp.onCutRemove} />
      <Footer />
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
    PolyRequest: (req) => {
      dispatch({ type: "SET_POLY_REQUEST", req: req })
    },
    MarkerSelected: (req) => {
      dispatch({ type: "SET_MARKER_REQUEST", req: req })
    },
    setStationPackLink: (link) => {
      dispatch({ type: "SET_STATION_PACK_LINK", link: link })
    },
    setWeatherPackLink: (link) => {
      dispatch({ type: "SET_WEATHER_PACK_LINK", link: link })
    },
    setPolygons: (polygons) => {
      dispatch({ type: "SET_POLYGONS", polygons: polygons })
    },
    setPolygonsInGeo: (polygons) => {
      dispatch({ type: "SET_GEO_POLYGONS", polygons: polygons })
    }
  });

export default connect(mapStateToProps, mapDispatchToProps)(Main);
