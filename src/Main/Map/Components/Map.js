import React, {Component} from 'react';
import {TileLayer, Map, Marker, Tooltip} from 'react-leaflet';
import L, {LatLng} from 'leaflet';
import 'bootstrap/dist/js/bootstrap.min.js';
import $ from 'jquery';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import connect from "react-redux/es/connect/connect";
import 'leaflet.pm';

export var mymap = null,
  markerGroup;

//NOTICE:
// This map Component (currently leaflet)
// may be replaced with D3 map or other based on WebGL

const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(40, 40, true)
  });
};

class MapX extends Component {
  constructor(props) {
    super(props);

    this.state = {
      innerMarker: [],
      lastPoly: [],
      tcontent: null,
      lat: 48.289559,
      lng: 31.3205566,
      zoom: 6,
      id: 'mapbox.streets',
      markers: null,
      updated: false,
      attribution: "Map data &copy; <a href='http://t.me/maxrev'>MaxRev</a> <a href='http://openstreetmap.org'>OpenStreetMap</a>",
      tiles: "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF4cmV2IiwiYSI6ImNqZGM3anI1bzY5M2EzMm81cDV6aDFncGIifQ.Uv0Ta09hEHEjClTd8paWFA"
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
      removalMode: true, // adds a button to remove layers
    };

    mymap.pm.addControls(options);

    mymap.on('pm:remove', (e) => {
      console.log(e);
      let lastPoly = this.state.lastPoly;
      let tg = lastPoly.filter((pl) => pl.layer !== e.layer);
      this.setState({lastPoly: tg});
      this.props.PolySelected(false);
      this.clearCardAndMarkers();
    });

    mymap.on('pm:create', (e) => {
      let lastPoly = this.state.lastPoly
      lastPoly.push(e);
      this.setState({lastPoly})
      e.layer.on('pm:dragend', () => {
        this.fetchMarkers(e)
      });
      e.layer.on('pm:markerdragend', () => {
        this.fetchMarkers(e)
      });
      this.fetchMarkers(e)
    });
  };

  componentDidMount() {
    this.initDraw(mymap);
  }

  clearCardAndMarkers = () => {
    this.props.setCardItem([]);
    this.props.clearMarkers();
    this.props.clearWeather();
    this.clearPoly();
  };

  clearPoly = () => {
    console.log(mymap);
    //L.layerGroup().removeFrom(mymap);
    /* for (let i in mymap._layers) {
       if (mymap._layers[i]) {
         try {
          // mymap.removeLayer(mymap._layers[i]);
           mymap._layers[i].unbindTooltip();
         } catch (e) {
           console.log("problem with " + e + mymap._layers[i]);
         }
       }
     }*/

  };

  whenReady() {
    mymap = this;
    mymap.on('click', () => {
      if (mymap.scrollWheelZoom.enabled()) {
        mymap.scrollWheelZoom.disable();
      } else {
        mymap.scrollWheelZoom.enable();
      }
    });
    L.control.zoom({position: 'topright'}).addTo(mymap);
    markerGroup = L.layerGroup().addTo(mymap);
  }

  onMarkerClick = (e) => {
    console.log("ON MARKER CLICK!");
    this.props.activeMarker(e.target);
    $('.leaflet-marker-icon').removeClass('marker-active');
    $(e.target._icon).addClass("marker-active")
  };

  renderOne = (w) => {
    return (<Marker onClick={
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

  fetchMarkers = (e) => {
    const {PolySelected, setPolyRequest,onStationsData, setWeather, api, date, year} = this.props;

    PolySelected(true);
    e = e.layer;

    setPolyRequest(api.createPolyRequest(e));

    api.getStationsFromMapEvent(e) .then((stations) => {
      onStationsData(stations, e._latlngs);
    }).catch((error) => console.log(error));

    if(date.dateSet || year)
    api.getWeatherFromMapEvent({e: e, date: date, year: year})
      .then((weather) => {
      setWeather(weather.response);
    }) .catch((error) => console.log(error));

    api.getPackFromMapEvent(e).then((pack) => {
      //this.props.onStationsData(stations, e._latlngs);
    }).catch((error) => console.log(error));
  };


  renderMarkers = () => {
    if (this.props.currentSelected) {
      return this.props.currentSelected.map((w) => this.renderOne(w));
    } else if (this.props.markers) {
      return this.props.markers.map((w) => this.renderOne(w));
    } else if (!this.props.currentSelected) {
      console.log(this.props.currentSelected);
      return null;
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      nextProps.markers && nextProps.markers[0] &&
      this.props.markers[0] === nextProps.markers[0]
    )
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const markers = this.renderMarkers();

    return (<Map id="mapid" className="markercluster-map" whenReady={this.whenReady} center={position} style={{
      height: "100%",
      width: "100%",
      position: "relative"
    }} zoom={this.state.zoom} preferCanvas="True" scrollWheelZoom={false} zoomControl={false}>
      <TileLayer attribution={this.state.attribution} url={this.state.tiles}/>
      {markers &&
      <MarkerClusterGroup chunkedLoadind={true} showCoverageOnHover={true}
                          iconCreateFunction={createClusterCustomIcon}>
        {markers}
      </MarkerClusterGroup>
      }
    </Map>);
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  PolySelected: (flag) => {
    dispatch({type: "IF_POLY_SELECTED", flag: flag})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MapX);