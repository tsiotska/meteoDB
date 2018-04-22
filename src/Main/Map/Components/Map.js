import React, {Component} from 'react';
import {TileLayer, Map, Marker, Tooltip, LayerGroup} from 'react-leaflet';
import L from 'leaflet';
import 'bootstrap/dist/js/bootstrap.min.js';
import $ from 'jquery';
export var mymap = null,
  markerGroup;

export default class MapX extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tcontent: null,
      lat: 48.289559,
      lng: 31.3205566,
      zoom: 6,
      id: 'mapbox.streets',
      markers: null,
      updated: false,
      attribution: "Map data &copy; <a href=&quot;t.me/maxrev_official&quot;>MaxRev</a> <a href=&quot;http://openstreetmap.org&quot;>OpenStreetMap</a> contributors, <a href=&quot;http://creativecommons.org/licenses/by-sa/2.0/&quot;>CC-BY-SA</a>, Imagery &copy; <a href=&quot;http://mapbox.com&quot;>Mapbox</a>",
      tiles: "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF4cmV2IiwiYSI6ImNqZGM3anI1bzY5M2EzMm81cDV6aDFncGIifQ.Uv0Ta09hEHEjClTd8paWFA"
      //tiles: "https://api.mapbox.com/styles/v1/maxrev/cjf40uy270w732spgop35y60x/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF4cmV2IiwiYSI6ImNqZGM3anI1bzY5M2EzMm81cDV6aDFncGIifQ.Uv0Ta09hEHEjClTd8paWFA"
    }
  }
  whenReady() {
    mymap = this;
    mymap.on('click', function() {
      if (mymap.scrollWheelZoom.enabled()) {
        mymap.scrollWheelZoom.disable();
      } else {
        mymap.scrollWheelZoom.enable();
      }
    });
    L.control.zoom({position: 'topright'}).addTo(mymap);
    markerGroup = L.layerGroup().addTo(mymap);
  }
  OnMarkerClick = (e) => {
    this.props.ActiveMarker(e.target);
    $('.leaflet-marker-icon').removeClass('marker-active')
    $(e.target._icon).addClass("marker-active")
  }
  RenderOne = (w) => {
    return (<Marker onClick={(e) => {
        this.OnMarkerClick(e);
        w.click(e)
      }} key={w.id_cnt} position={w.position}>
      <Tooltip className="XCustTooltip">
        {w.content}
      </Tooltip>
    </Marker>);
  }

  RenderMarkers = (e) => {
    if (!e) 
      return null;
    var els = [];
    console.log("Markers redraw")

    if (this.props.currentSelected) {
      this.props.currentSelected.forEach((w) => {
        els.push(this.RenderOne(w))
      })
    }
    if (!e || this.props.currentSelected.length > 0) 
      return els;
    e.forEach((w) => {
      els.push(this.RenderOne(w))
    })
    return els;
  }
  render() {
    const position = [this.state.lat, this.state.lng]
    return (<Map id="mapid" whenReady={this.whenReady} center={position} style={{
        height: "100%",
        width: "100%",
        position: "relative"
      }} zoom={this.state.zoom} scrollWheelZoom={false} zoomControl={false}>
      <TileLayer attribution={this.state.attribution} url={this.state.tiles}/>
      <LayerGroup>
        {this.RenderMarkers(this.props.markers)}
      </LayerGroup>
    </Map>);
  }
}
