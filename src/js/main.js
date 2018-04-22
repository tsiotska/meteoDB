import React, {Component} from 'react';
import $ from 'jquery';
import {mymap} from '../Main/Map/Components/Map';
import L from 'leaflet';
import WeatherControl from "../Main/Elements/WeatherControl";
import PageNav from '../Main/Controls/PageNavItem';
import Station from '../Main/Elements/StationTemplate';
import CountryItem from '../Main/Elements/CountryItemTemplate';
import MapComponent from '../Main/Map/MapComponent'
import 'leaflet-selectareafeature';
import throttle from 'lodash/throttle';
import Nav from '../Main/NavbarTop';
import Loader from '../Main/Elements/AtomLoader';
import Containers from "../Main/Containers";
import 'leaflet.pm';
import turf from 'turf'
var base = 'http://localhost:5000',
  markerGroup = null,
  Typeahead = require('typeahead');

L.Polygon.include({
  contains: function(latLng) {
    return turf.inside(new L.Marker(latLng).toGeoJSON(), this.toGeoJSON());
  }
});

L.Rectangle.include({
  contains: function(latLng) {
    return this.getBounds().contains(latLng);
  }
});

L.Circle.include({
  contains: function(latLng) {
    return this.getLatLng().distanceTo(latLng) < this.getRadius();
  }
});

function GenMaker(e, click, content, cnt) {
  return {position: e, click: click, content: content, id_cnt: cnt}
}
function SmothScroll() {
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
    if (window.location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && window.location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length
        ? target
        : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000, function() {
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) {
            return false;
          } else {
            $target.attr('tabindex', '-1');
            $target.focus();
          };
        });
      }
    }
  });
}
export function CreativeSt(e, cnt, click) {
  return <Station click={click} key={cnt} id={cnt} props={e}/>;
}
export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mouse: {
        lat: null,
        lng: null
      },
      togglerSelect: false,
      markerGroup: null,
      isVisible: false,
      loadingProgress: 0,
      daysItems: [],
      currentSelected: [],
      lastPoly: [],
      Typeahead: Typeahead,
      stationsCounter: null
    }

    this.OnMarkerClick = throttle(this.OnMarkerClickBase, 500)
  }
  componentDidMount() {
    this.SetHandlers()
    this.SetDocumentVars()
    this.InitDraw()
  }
  InitDraw = () => {
    var options = {
      position: 'topright', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
      drawMarker: false, // adds button to draw markers
      drawPolyline: false, // adds button to draw a polyline
      drawRectangle: true, // adds button to draw a rectangle
      drawPolygon: true, // adds button to draw a polygon
      drawCircle: true, // adds button to draw a cricle
      editMode: true, // adds button to toggle edit mode for all layers
      removalMode: true, // adds a button to remove layers
    };
    mymap.pm.addControls(options);
    mymap.on('pm:remove', (e) => {
      var lastPoly = this.state.lastPoly
      var tg = lastPoly.filter((pl) => {
        var f = pl.layer !== e.layer;
        if (!f) 
          this.setState({currentSelected: []})
        return f;
      })
      this.setState({lastPoly: tg})
    });
    mymap.on('pm:create', (e) => {
      var lastPoly = this.state.lastPoly
      lastPoly.push(e)
      this.setState({lastPoly: lastPoly})
      e.layer.on('pm:dragend', () => {
        this.GetMarkersInPoly(e)
      });
      e.layer.on('pm:markerdragend', () => {
        this.GetMarkersInPoly(e)
      });
      this.GetMarkersInPoly(e)
    });
  }

  GetMarkersInPoly = (e) => {
    if (this.state.MapMarkers) {
      let markers = this.state.MapMarkers
      let res = []
      markers.forEach(function(marker) {
        if (e.layer.contains(marker.position)) {
          res.push(marker.position)
        }
      });
      var mks_sel = this.state.MapMarkers.filter(function(m) {
        return res.includes(m.position)
      });
      this.setState({currentSelected: mks_sel})
    }
  }
  LoadingStarted = () => {
    this.setState({isVisible: true})
  }
  LoadingFinished = () => {
    setTimeout(() => {
      this.setState({isVisible: false})
    }, 900)
    setTimeout(() => {
      this.setState({loadingProgress: 0})
    }, 2000)
  }
  SetMarkers = (e) => {
    this.setState({MapMarkers: e})
  }
  CreativeDay(e, cnt) {
    return <WeatherControl key={cnt} data={e}/>;
  }
  CountCircle(resp) {
    return (<p className="text-center card-text">
      {
        (
          (resp.code === 33)
          ? "NOT FOUND"
          : " Found: " + (
            (!resp.Item2)
            ? resp.length
            : resp.Item2.length))
      }
    </p>);
  }

  SetDocumentVars = () => {
    var lx = window.location.search.substr(1);
    window.history.replaceState({}, "WeatherConsole", "/#!");
    $('[data-toggle="tooltip"]').tooltip();
    $('nav a').click(function(e) {
      e.preventDefault();
    });

    $.ajax(base + "/api/db?years=").done((data) => {
      Typeahead($("#years")[0], {source: data});
      $("#years").removeAttr('readonly');
    });
    $.ajax(base + "/api/db?countries=").done((data) => {
      Typeahead($("#querystr")[0], {source: data});
      $('#querystr').removeAttr('readonly');
    });
    $.ajax(base + "/api/db?st_count=").done((data) => {
      if (data) {
        var cnt = 0;
        this.setState({
          ctr_list: data.map((i) => {
            return <CountryItem key={cnt++} SetQuery={this.SetQuery} e={i}/>;
          })
        })
        $('#ctr-list').removeAttr('readonly');
      }
    });

    if (lx) {
      $.ajax(base + "/api/db?" + lx).done((data) => {
        this.SetWeathItem(data);
      });
    }
    //  SmothScroll();
  }
  GetTooltipForMarker(i) {
    return CreativeSt(i)
  }
  OnStationClick = (e) => {
    this.setState({
      currentStation: CreativeSt(e, 0, this.OnStationClick)
    })
    this.GetWeathForLatLon(e);
  }
  OnSearchFetched(resp, cnt) {
    SmothScroll();
    console.log("Fetched search");
    let lastPoly = this.state.lastPoly
    if (lastPoly.length > 0) {
      let layer = lastPoly[lastPoly.length - 1];
      this.GetMarkersInPoly(layer)
    }
    this.setState({stationsCounter: this.CountCircle(resp)})
    if (resp.code === 33) 
      return;
    var data = (!resp.Item2)
      ? resp
      : resp.Item2;
    if (markerGroup) 
      mymap.removeLayer(markerGroup);
    markerGroup = L.layerGroup().addTo(mymap);

    data.sort();

    cnt = 0;
    let fx = data.filter(function(i) {
      return i.lat && i.lon && i.lat !== '+00.000';
    });
    this.setState({
      stationsAll: fx.map((i) => CreativeSt(i, cnt++, this.OnStationClick))
    })
    var markers = [],
      area_latlon = [];
    for (var o = 0; o < fx.length; o++) {
      var i = fx[o];

      let lt = L.latLng(i.lat, i.lon)
      area_latlon.push(lt);
      markers.push(GenMaker(lt, this.OnMarkerClick, this.GetTooltipForMarker(i), o));
    }
    this.SetMarkers(markers)
    mymap.fitBounds(area_latlon);
  }
  ConvertResponse = () => {}
  OnSearchClick = (e) => {
    this.LoadingStarted()
    var cnt = 0;
    if ($('#cnt').val() !== '∞') 
      cnt = $('#cnt').val();
    $.ajax(base + '/api/db?of=0&t=' + $('#type').val() +/* '&cnt=' + cnt + */
    '&cname=' + $('#querystr').val(), {complete: this.LoadingFinished}).done((resp) => {
      this.OnSearchFetched(resp, cnt)
    });
  }
  OnMarkerClick() {
    this.OnMarkerClick.cancel()
  }
  GetWeathForLatLon = (t) => {
    $.ajax(base + '/api/db?of=0&lat=' + t.lat + '&lon=' + (
    t.lng || t.lon) + "&year=" + $("#years").val(), {
      xhr: () => {
        this.LoadingStarted()
        var xhr = new window.XMLHttpRequest();
        xhr.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            setTimeout(() => {
              this.setState({loadingProgress: percentComplete});
            }, 4);
          }
        }, false);
        return xhr;
      },
      complete: this.LoadingFinished
    }).done((data) => {
      this.SetWeathItem(data);
    });
  }
  OnMarkerClickBase = (e) => {
    var t = e.target.getLatLng();/* '&cnt=' + $('#daysCnt').val() */
    this.GetWeathForLatLon(t);
  }
  SetQuery = (e) => {
    $('#type').val('ctry_full');
    $('#querystr').val(e);
    this.OnSearchClick();
  }
  SetWeathItem = (e) => {
    var data = e,
      cnt = 0;
    if (data.data) {
      this.setState({
        currentStation: CreativeSt(data.item, 0, this.OnStationClick)
      })
      if (data.data.Item2) {
        this.setState({
          daysItems: data.data.Item2.map((i) => {
            return this.CreativeDay(i, cnt++);
          })
        })
      }
    }
  }
  CreatePageNavItem(name, full_href, href, cnt, active = false, disabled = false) {
    var hrefx = href
      ? href
      : full_href;
    return <PageNav href={hrefx} key={cnt} active={active} text={name} disabled={disabled} onClick={(e) => {
        e.preventDefault();
        this.GetData(full_href);
        return false
      }}/>;
  }
  GetData = (e) => {
    this.LoadingStarted();
    $.ajax(e, {complete: this.LoadingFinished}).done((data) => {
      this.SetWeathItem(data);
    });
  }
  SetHandlers = () => {
    $('#flyn_toggle').on('click', () => {
      $('.flyn').toggleClass('active');
    });
    //$('#reeval').on('click', this.OnSearchClick);
    $('#refresh').click(() => {
      mymap.setView([
        48.289559, 31.3205566
      ], 6);
      this.SetMarkers([]);
      this.setState({lastPoly: []})
    });
    $("#years").change((e) => {
      e.handled = true;
      if ($("#years").val().length === 4) {
        $("#stx .stx_l1").removeClass('fade');
        $.ajax(base + "/api/db?st_year=" + $("#years").val(), {
          type: 'JSON',
          dataType: 'json',
          cache: false
        }).done((data) => {
          Typeahead($("#id_st")[0], {source: data});
          $("#stx .stx_l1").addClass('fade');
          $('#id_st').removeAttr('readonly');
        });
      }
    });
    $("#id_st").change(() => {
      if ($("#id_st").val() === 'N/A' || $("#id_st").val().length === 6) {
        $("#stx .stx_l2").removeClass('fade');
        $.ajax(base + "/api/db?id=" + $("#id_st").val() + "&year=" + $("#years").val(), {
          type: 'JSON',
          dataType: 'json'
        }).done((data) => {
          Typeahead($("#wban_st")[0], {source: data});
          $("#stx .stx_l2").addClass('fade');
          $('#wban_st').removeAttr('readonly');
        });
      }
    });
    $("#wban_st").change(() => {
      if ($("#wban_st").val() === 'N/A' || $("#wban_st").val().length === 6) {
        $("#datex .cssload-container").removeClass('fade');
        $.ajax(base + "/api/db?id=" + $("#id_st").val() + "&wban=" + $("#wban_st").val() + "&year=" + $("#years").val()).done((data) => {
          Typeahead($("#date")[0], {source: data});
          $("#datex .cssload-container").addClass('fade');
          $('#date').removeAttr('readonly');
        });

      }
    });
  }
  OnMapPageChanged(e) {
    mymap.fitBounds(e.map((r) => {
      return r.position;
    }));
  }
  ActiveMarker(e) {
    console.log("Active: " + e.options.position)
  }
  OnMouseMove(e) {
    return "lat: " + e.latlng.lat + " lng: " + e.latlng.lng;
  }
  render() {
    return (<div className="container-fluid p-0">
      <Nav/>
      <MapComponent ActiveMarker={this.ActiveMarker} Typeahead={this.state.Typeahead} PageChanged={this.OnMapPageChanged} currentSelected={this.state.currentSelected} currentStation={this.state.currentStation} counter={this.state.stationsCounter} markers={this.state.MapMarkers} OnSearchClick={this.OnSearchClick} OnMarkerClick={this.OnMarkerClick}/>
      <Loader progress={this.state.loadingProgress} isVisible={this.state.isVisible}/>
      <Containers ctr_list={this.state.ctr_list} stations={this.state.stationsAll} daysItems={this.state.daysItems}/>
    </div>)
  }
};
