import React, {Component} from 'react';
import $ from 'jquery';
import {mymap} from 'Main/Map/Components/Map';
import L from 'leaflet';
import WeatherControl from "Main/Elements/WeatherControl";
import PageNav from 'Main/Controls/PageNavItem';
import Station from 'Main/Elements/StationTemplate';
import MapComponent from 'Main/Map/MapComponent'
import 'leaflet-selectareafeature';
import throttle from 'lodash/throttle';
import Nav from 'Main/NavbarTop';
import Loader from 'Main/Elements/AtomLoader';
import Containers from "Main/Containers";
import CountCircle from 'Main/Elements/CountCircle';
import 'leaflet.pm';
import {baseUrl} from "js/const"
import Footer from 'Main/Elements/Footer'
import {ApiController} from 'js/apicontroller'
import 'js/map_extensions'
var base = baseUrl,
  markerGroup = null,
  Typeahead = require('typeahead');

function genMaker(e, click, content, cnt, i) {
  return {position: e, click: click, content: content, id_cnt: cnt, data: i}
}
export function creativeSt(e, cnt, click) {
  return <Station click={click} key={cnt} id={cnt} props={e}/>;
}
function flatten(arr) {
  return arr.reduce(function(flat, toFlatten) {
    return flat.concat(
      Array.isArray(toFlatten)
      ? flatten(toFlatten)
      : toFlatten);
  }, []);
}
export default class Main extends Component {
  constructor(props) {
    super(props)
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
      Typeahead: Typeahead,
      stationsCounter: null,
      lockM: true
    }
    this.onMarkerClick = throttle(this.onMarkerClickBase, 500)
  }
  progressChanged = (amount) => {
    this.setState({loadingProgress: amount});
  }
  componentDidMount() {
    this.setHandlers()
    this.setDocumentVars()
  }

  loadingStarted = () => {
    this.setState({isVisible: true})
  }
  // react redux use???
  loadingFinished = () => {
    setTimeout(() => {
      this.setState({isVisible: false})
    }, 900)
    setTimeout(() => {
      this.setState({loadingProgress: 0})
    }, 2000)
  }
  setMarkers = (e) => {
    this.setState({MapMarkers: e})
  }
  creativeDay(e, cnt) {
    return <WeatherControl key={cnt} data={e}/>;
  }
  setDocumentVars = () => {
    var lx = window.location.search.substr(1);
    window.history.replaceState({}, "WeatherConsole", "/#!");
    $('[data-toggle="tooltip"]').tooltip();
    $('nav a').click(function(e) {
      e.preventDefault();
    });

    this.state.api.getYears().done((data) => {
      Typeahead($("#years")[0], {source: data.response});
      $("#years").removeAttr('readonly');
    });

    if (lx && !lx.includes('react_perf')) {
      $.ajax(base + "/api/db?" + lx).done((data) => {
        this.setWeathItem(data.response);
      });
    }
    //  SmothScroll();
  }
  onStationClick = (e) => {
    this.setState({
      currentStation: creativeSt(e, 0, this.onStationClick)
    })
    this.getWeathForLatLon(e);
  }

  onSearchFetched = (resp, lngs) => {
    console.log("Fetched search");
    this.setState({lockM: true})
    this.setState({stationsCounter: <CountCircle response={resp}/>})
    console.log(resp);
    if (resp.code === 33)
      return;
    var data = (!resp.Item2)
      ? resp
      : resp.Item2; // hardcoded. maybe review API models
    if (data.response && Array.isArray(data.response) && data.response[0].item) {
      data.response = flatten(data.response.map(function(e) {
        return e.data
      }));
    }
    if (markerGroup)
      mymap.removeLayer(markerGroup);
    markerGroup = L.layerGroup().addTo(mymap);

    let cnt = 0;
    let fx = Array.isArray(data.response) && data.response.filter(function(i) {
      return i.lat && i.lon && i.lat !== '+00.000';
    });
    if (fx)
      this.setState({
        stationsAll: fx.map((i) => creativeSt(i, cnt++, this.onStationClick))
      })
    var markers = [],
      area_latlon = [];
    for (var o = 0; o < fx.length; o++) {
      var i = fx[o];

      let lt = L.latLng(i.lat, i.lon)
      area_latlon.push(lt);
      markers.push(genMaker(lt, this.onMarkerClick, creativeSt(i), o, i));
    }
    this.setMarkers(markers)
    mymap.fitBounds(L.latLngBounds(lngs || area_latlon));
  }
  onMarkerClick() {
    this.onMarkerClick.cancel()
  }
  getWeathForLatLon = (t) => {
    let g = this.selTimeFun();
    let isYear = g.includes('year');
    let api = isYear
      ? this.state.api.ofTimeExp(g)
      : this.state.api.ofRangeExp(g);
    api.getWeathForLatLon($('#type').val(), t.lat, t.lng).done((data) => {
      this.setWeathItem(data);
    });
  }
  onMarkerClickBase = (e) => {
    var t = e.target.getLatLng();
    this.getWeathForLatLon(t);
  }
  setWeathItem = (e) => {
    var data = e.response,
      cnt = 0;
    if (data.data) {
      this.setState({
        currentStation: creativeSt(data.item, 0, this.onStationClick)
      })
      if (data.data.Item2) { // hardcoded, I know
        this.setState({
          daysItems: data.data.Item2.map((i) => {
            return this.creativeDay(i, cnt++);
          })
        })
      }
    }
  }
  createPageNavItem(name, full_href, href, cnt, active = false, disabled = false) {
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
    this.state.api.mainAPIFetch(e).done((data) => {
      console.log(data);
      this.setWeathItem(data);
    });
  }
  setHandlers = () => {}
  onMapPageChanged = (e) => {
    if (this.state.lockM) {
      this.setState({lockM: false})
      return;
    }
    var t = e.map((r) => {
      return r.position;
    });
    if (t.length > 0) {
      mymap.fitBounds(t);
    }
  }
  activeMarker(e) {
    console.log("Active: " + e.options.position)
  }
  onMouseMove(e) {
    return "lat: " + e.latlng.lat + " lng: " + e.latlng.lng; // wasn't applied
  }
  onBigDataFetched = (e) => {
    console.log("Fetched BigData Query");
    //if (e.response && e.response[0] && !e.response[0].id)
    this.setState({DownloadList: e.response})
    //  else
    //this.onSearchFetched(e)
  }
  setCtrList = (list) => {
    this.setState({ctr_list: list})
  }
  selectedIndexChange = (e) => {
    this.setState({mapSelectedIndex: e})
  }
  onRefreshClick = () => {
    mymap.setView([
      48.289559, 31.3205566 // Ukraine centered
    ], 6);
    this.setMarkers([]);
    this.setState({lastPoly: []})
  }
  // Naming conflict -> refactor later
  SelTimeFun = (m) => {
    this.selTimeFun = m;
  }
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
      onBigDataFetched: this.onBigDataFetched,
      onSearchFetched: this.onSearchFetched,
      activeMarker: this.activeMarker,
      PageChanged: this.onMapPageChanged,
      onMarkerClick: this.onMarkerClick,
      onRefreshClick: this.onRefreshClick,
      SelTime: this.SelTimeFun
    }
    let conts = {
      ctr_list: this.state.ctr_list,
      mapSelectedIndex: this.state.mapSelectedIndex,
      DownloadList: this.state.DownloadList,
      selectedStations: this.state.stationsAll,
      stations: this.state.stationsAll,
      daysItems: this.state.daysItems
    }
    return (<div className="container-fluid p-0">
      <Nav/>
      <MapComponent {...comp}/>
      <Loader progress={this.state.loadingProgress} isVisible={this.state.isVisible}/>
      <Containers {...conts}/>
      <Footer/>
    </div>)
  }
};
