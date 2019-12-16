import React, {Component} from 'react';
import {TileLayer, Map, Marker, Tooltip} from 'react-leaflet';
import L from 'leaflet';
import 'bootstrap/dist/js/bootstrap.min.js';
import $ from 'jquery';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import connect from "react-redux/es/connect/connect";
import 'leaflet.pm';
import {renderToStaticMarkup} from 'react-dom/server';
import {divIcon} from 'leaflet';
import {createStation} from "../Main";

export var mymap = null,
  markerGroup;

//NOTICE:
// This map Component (currently leaflet)
// may be replaced with D3 map or other based on WebGL
/*
 const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(40, 40, true)
  });
};*/

class MapComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      innerMarker: [],
      tcontent: null,
      lat: 48.289559,
      lng: 31.3205566,
      zoom: 6,
      id: 'mapbox.streets',
      markers: null,
      updated: false,
      attribution: "Map data &copy; <a href='http://t.me/maxrev'>MaxRev</a> <a href='http://openstreetmap.org'>OpenStreetMap</a>",
      tiles: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      //tiles: "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF4cmV2IiwiYSI6ImNqZGM3anI1bzY5M2EzMm81cDV6aDFncGIifQ.Uv0Ta09hEHEjClTd8paWFA"
      //tiles: "https://api.mapbox.com/styles/v1/maxrev/cjf40uy270w732spgop35y60x/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF4cmV2IiwiYSI6ImNqZGM3anI1bzY5M2EzMm81cDV6aDFncGIifQ.Uv0Ta09hEHEjClTd8paWFA"
    }
  }


  initDraw = (mymap) => {
    let options = {
      position: 'topright', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
      drawMarker: false, // adds button to draw markers
      drawPolyline: false, // adds button to draw a polyline
      drawRectangle: true, // adds button to draw a rectangle
      drawPolygon: true, // adds button to draw a polygon
      drawCircle: true, // adds button to draw a circle
      editMode: true, // adds button to toggle edit mode for all layers
      removalMode: true, // adds a button to remove layers,
      cutPolygon: false
    };

    mymap.pm.addControls(options);

    mymap.on('pm:remove', (e) => {
      console.log(e)
      console.log(!e.layer.options.hasOwnProperty("position"))

      if (!e.layer.options.hasOwnProperty("position")) {
        this.props.deleteLastPoly(e);
        this.props.onToolRemove(e);
      }
    });

    mymap.on('pm:create', (e) => {
      console.log(e)
      e.layer.on('pm:dragend', () => {
        console.log(e)
        this.fetchMarkers(e)
      });

      e.layer.on('pm:dragstart', () => {
        this.props.beforeMove(e)
      });

      e.layer.on('pm:edit', () => {
        console.log(e)
        this.fetchMarkers(e)
      });

      this.fetchMarkers(e)
    });
  };

  componentDidMount() {
    this.initDraw(mymap);
  }


  whenReady() {
    mymap = this;
    // disable zoom toggle on click in new layout
    /* mymap.on('click', () => {
      if (mymap.scrollWheelZoom.enabled()) {
        mymap.scrollWheelZoom.disable();
      } else {
        mymap.scrollWheelZoom.enable();
      }
    }); */
    mymap.scrollWheelZoom.enable();
    L.control.zoom({position: 'topright'}).addTo(mymap);
    markerGroup = L.layerGroup().addTo(mymap);
  }

  onMarkerClick = (e) => {
    this.props.activeMarker(e);
  };


  fetchMarkers = (e) => {
    const {
      onStationsSelection, onWeatherData,
      api, date, years, months, days /* neigh, nearest, offset, limit */
    } = this.props;

    api.getStationsFromMapEvent({
      e: e.layer,
    }).then((stations) => {
      onStationsSelection(stations, e);
    }).catch((error) => console.log(error));

    if (date.dateSet || years) {
      api.getWeatherFromMapEvent({e: e.layer, date: date, years: years, months: months, days: days})
        .then((weather) => {
          onWeatherData(weather.response)
        }).catch((error) => console.log(error))
    }
  };


  renderMarkers = () => {
    console.log("Render markers...")
    const {markers, setSelectedStation, stations} = this.props;
    if (markers.length === 1) {
      let style = "fas fa-map-marker-alt coloredSelectedMarker fa-3x";
      console.log(stations[0])
      setSelectedStation(createStation(stations[0].props.props, 0));
      return this.renderOne(markers[0], style);

    } else if (markers.length > 1) {
      let style = "fas fa-map-marker-alt coloredUnselectedMarker fa-3x";
      return markers.map((w) => this.renderOne(w, style));
    } else {
      return null;
    }
  };

  renderOne = (w, markerStyle) => {
    const customMarkerIcon = divIcon({className: markerStyle});
    return (<Marker icon={customMarkerIcon} onClick={
      (e) => {
        this.onMarkerClick(e);
        w.click(e)
      }
    } key={w.id_cnt} position={w.position}>
      <Tooltip className="XCustTooltip">
        {w.content}
      </Tooltip>
    </Marker>);
  };


  render() {
    const position = [this.state.lat, this.state.lng];
    let markers = this.renderMarkers();
    let {counter} = this.props;
    return (
      <div className="main_map container-fluid p-0">
        <div className="cur_count_wrapper">
          <div className={"cur_count " + (
            counter
              ? ""
              : "fade")} id="result-info">{counter}</div>
        </div>
        <Map id="mapid" className="markercluster-map"
             whenReady={this.whenReady} center={position}
             style={{
               height: "100%",
               width: "100%",
               position: "relative"
             }} zoom={this.state.zoom} preferCanvas="True"
             scrollWheelZoom={false} zoomControl={false}>
          <TileLayer attribution={this.state.attribution} url={this.state.tiles}/>
          {markers &&
          <MarkerClusterGroup chunkedLoadind={true} showCoverageOnHover={true}>
            {markers}
          </MarkerClusterGroup>
          }
        </Map>
      </div>);
  }
}

const mapStateToProps = state => ({
  years: state.dataReducer.years,
  months: state.dataReducer.months,
  days: state.dataReducer.days,
  date: state.dataReducer.date,

  neigh: state.dataReducer.neigh,
  nearest: state.dataReducer.nearest,
  offset: state.dataReducer.offset,
  limit: state.dataReducer.limit,

  markers: state.dataReducer.markers,
  polygons: state.dataReducer.polygons,
  stations: state.dataReducer.stations
});


const mapDispatchToProps = dispatch => ({
  deleteLastPoly: (polygon) => {
    dispatch({type: "DELETE_LAST_POLY", polygon: polygon})
  },
  setSelectedStation: (selected) => {
    dispatch({type: "SET_SELECTED_STATION", selected: selected})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);


