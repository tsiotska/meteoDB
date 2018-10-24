import React from 'react';
import {Button} from 'reactstrap';
import Map from './Components/Map';
import Pagination from 'Main/Controls/Pagination';
import {baseUrl} from 'js/const';
import DatePicker from 'Main/Controls/DatePicker'
import $ from 'jquery';
import {Typeahead} from 'react-bootstrap-typeahead';
import CountryItem from 'Main/Elements/CountryItemTemplate';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
var TypeaheadW = require('typeahead'),
  initdate = {
    dateSet: false,
    startDate: null,
    endDate: null
  };
export default class MapComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.s_type = React.createRef();
    this.ajax = null;
    this.state = {
      isLoading: true,
      selectedPage: [],
      querySource: [],
      SelectedCountry: null,
      ctr_list: [],
      lastPoly: null,
      date: initdate
    };
  }
  componentDidMount() {
    this.props.SelTime(this.getSelectedTime.bind(this))
    this.ajax = $.ajax(baseUrl + "/api/db?st_count=")
    this.ajax.done((data) => {
      if (data && data.response) {
        var cnt = 0;
        this.setState({
          querySource: data.response.map(function(i) {
            return i.Item1;
          }),
          isLoading: false
        })
        this.props.SetCtrList(data.response.map((i) => {
          return <CountryItem key={cnt++} setQuery={this.setQuery} e={i}/>;
        }))
      }
    })
  }
  componentWillUnmount() {
    this.ajax.abort()
  }
  onChangePage = (selectedPage, index) => {
    this.props.PageChanged(selectedPage);
    console.log("page markers change");
    this.props.mapSelectedIndex(index)
    this.setState({selectedPage: selectedPage});
  }
  onTypeChanged = (e) => {
    let p = e.target.value
    this.props.api.MainApiFetch(baseUrl + '/api/db?getTypeList&t=' + p).done((data) => {
      this.setState({querySource: data.response})
    })
  }
  currentStation = () => {
    return (<div id="flyn_current_station" className="w-100 d-flex flex-column">
      {this.props.currentStation}</div>);
  }
  setQuery = (e) => {
    this.s_type.current.value = 'ctry_full';
    $('#querystr').val(e);
    this.onSearchClick(e);
  }
  onRefreshClick = (e) => {
    this.props.onRefreshClick(e);
  }
  getPolyStr() {
    let polyreq,
      e = this.state.lastPoly.layer,
      lngs = null;
    if (e.options.radius !== undefined) {
      let res = [e._latlng.lat, e._latlng.lng, e.getRadius()]
      polyreq = "circ=[" + res + "]";
    } else {
      lngs = e._latlngs;
      var res = lngs.join('],[');
      polyreq = "poly=[" + res + "]";
    }
    return polyreq
  }
  getSelectedTime() {
    return this.state.date.dateSet
      ? '&s=' + this.state.date.startDate.format('DD.MM.YYYY') + '&e=' + this.state.date.endDate.format('DD.MM.YYYY')
      : (
        $("#years").val()
        ? "&year=" + $("#years").val()
        : '');
  }
  onSearchClick = (e) => {
    let isBigDataQuery,
      neighbors,
      querytype,
      polyreq,
      yeartime = (
        $("#years").val()
        ? "&year=" + $("#years").val()
        : '');
    let time = this.state.date.dateSet
      ? '&s=' + this.state.date.startDate.format('DD.MM.YYYY') + '&e=' + this.state.date.endDate.format('DD.MM.YYYY')
      : yeartime;
    let names = (
      typeof e === 'string'
      ? e
      : (this.state.SelectedCountry && this.state.SelectedCountry.join(',')) || this.props.markers.map((i) => {
        return i.data[this.s_type.current.value]
      }))
    if (this.state.lastPoly) {
      //polygon data fetch
      polyreq = this.getPolyStr()
    } else {
      var cntv = $('#count').val() || 0
      var offsetv = $('#offset').val() || 0
      isBigDataQuery = names.toString().includes(',') || (this.state.SelectedCountry && this.state.SelectedCountry.length > 1);
      neighbors = (
        $('#nbs_chk').prop('checked')
        ? '&nbs'
        : '');
      querytype = (
        isBigDataQuery
        ? '&query='
        : '&of=' + offsetv + '&cnt=' + cntv + '&cname=');
    }
    let qval = (
      polyreq
      ? polyreq
      : 't=' + this.s_type.current.value + neighbors + querytype + names);
    let reqs = baseUrl + '/api/db?' + qval + time;
    this.props.api.MainApiFetch(reqs).done((resp) => {

      if (yeartime || this.state.date.dateSet) 
        this.props.OnBigDataFetched(resp)
      else 
        this.props.OnSearchFetched(resp)
    });
  }

  /// HALF PORTED PART FROM JQUERY

  setLastPoly = (e) => {
    this.setState({lastPoly: e})
  }
  onYearsChange = () => {
    if ($("#years").val().length === 4) {
      $("#stx .stx_l1").removeClass('fade');
      this.props.api.GetStationsIdsForYear($("#years").val()).done((data) => {
        TypeaheadW($("#id_st")[0], {source: data.response});
        $("#stx .stx_l1").addClass('fade');
        $('#id_st').removeAttr('readonly');
      });
    }
  }
  onIdChange = () => {
    if ($("#id_st").val() === 'N/A' || $("#id_st").val().length === 6) {
      $("#stx .stx_l2").removeClass('fade');
      this.state.api.OfYear($("#years").val()).GetForId($("#id_st").val()).done((data) => {
        TypeaheadW($("#wban_st")[0], {source: data.response});
        $("#stx .stx_l2").addClass('fade');
        $('#wban_st').removeAttr('readonly');
      });
    }
  }
  onWbanChange = () => {
    if ($("#wban_st").val() === 'N/A' || $("#wban_st").val().length === 6) {
      $("#datex .cssload-container").removeClass('fade');
      this.state.api.OfYear($("#years").val()).GetForWban($("#id_st").val(), $("#wban_st").val()).done((data) => {
        TypeaheadW($("#date")[0], {source: data.response});
        $("#datex .cssload-container").addClass('fade');
        $('#date').removeAttr('readonly');
      });

    }
  }

  render() {
    console.log("map Component redraw");
    return (<div className="main_map container-fluid p-0">
      <Map ActiveMarker={this.props.ActiveMarker} OnPolySelected={this.setLastPoly} OnSearchFetched={this.props.OnSearchFetched} markers={this.state.selectedPage} currentSelected={this.props.markers}/>
      <div className="cur_count_wrapper">
        <div className={"cur_count " + (
            this.props.counter
            ? ""
            : "fade")} id="result-info">{this.props.counter}</div>
      </div>
      <div className="panel flyn active  card card-body">
        <div className="scrollable">
          <div className="form-inline ">

            <div className="form-inline row m-1">

              <div className="col-5  mb-1">
                <label htmlFor="type">Тип поля</label>
                <select defaultValue="ctry_full" ref={this.s_type} className="custom-select" onChange={this.onTypeChanged} id="type">
                  <option>id</option>
                  <option>wban</option>
                  <option>stname</option>
                  <option>ctry_full</option>
                  <option>ctry</option>
                  <option>st</option>
                  <option>icao</option>
                  <option>lat</option>
                  <option>lon</option>
                  <option>elev</option>
                  <option>beg</option>
                  <option>end</option>
                </select>

              </div>
              <div id="yearsx" className="col-5 mb-1">
                <label htmlFor="years">Рік</label>
                <div className="input-group">
                  <input type="text" id="years" onChange={this.onYearsChange} className="form-control typeahead" placeholder="Рік" data-provide="typeahead" readOnly="readOnly"/>
                  <div className="cssload-container fade">
                    <div className="cssload-whirlpool"></div>
                  </div>
                </div>
              </div>

              <div id="datex" className="col-auto  mb-1 ">
                <DatePicker OnClear={(e) => this.setState({date: e})} OnApply={(e) => this.setState({date: e})}/>
              </div>
            </div>
            <div className="col-auto mb-1">
              <label htmlFor="querystr">Пошуковий параметр</label>
              <div className="input-group disabled">
                <Typeahead multiple={true} isLoading={this.state.isLoading} placeholder="Пошуковий параметр" onChange={(selected) => {
                    this.setState({SelectedCountry: selected})
                  }} options={this.state.querySource}/>
              </div>
            </div>
            <div className="form-group w-50 ml-4 mb-1 form-check">
              <input type="checkbox" className="form-check-input" id="nbs_chk"/>
              <label className="form-check-label" htmlFor="exampleCheck1">Сусідні країни</label>

            </div>
            <div className="col-auto d-flex w-100">
              <button id="reeval" onClick={this.onSearchClick} className="btn btn-primary m-2 mb-1 mt-auto">Пошук</button>
              <button id="refresh" onClick={this.onRefreshClick} className="btn btn-secondary m-2 mb-1 mt-auto">Очистити</button>
            </div>
          </div>

          <div className="form-inline mx-auto">

            <div id="stx" className="col-auto mb-1">
              <label htmlFor="id_st">ID Станції</label>
              <div className="input-group">
                <input type="text" className="form-control typeahead" id="id_st" onChange={this.onIdChange} placeholder="123456" data-provide="typeahead" readOnly="readOnly"/>
                <div className="stx_l1 cssload-container fade">
                  <div className="cssload-whirlpool"></div>
                </div>
              </div>
              <label htmlFor="wban_st">WBAN Станції</label>
              <div className="input-group">
                <input type="text" className="form-control typeahead" id="wban_st" onChange={this.onWbanChange} placeholder="Станція" value="N/A" data-provide="typeahead" readOnly="readOnly"/>
                <div className="stx_l2 cssload-container fade">
                  <div className="cssload-whirlpool"></div>
                </div>
              </div>
            </div>
            <div className="row m-2">
              <div className="input-group  col-6 p-1">
                <div className="input-group-prepend">
                  <span className="input-group-text">Count</span>
                </div>
                <input type="text" id="count" className="form-control typeahead" placeholder="Count" data-provide="typeahead"/>
              </div>
              <div className="input-group  col-6 p-1">
                <div className="input-group-prepend">
                  <span className="input-group-text">Offset</span>
                </div>
                <input type="text" id="offset" className="form-control typeahead" placeholder="Offset" data-provide="typeahead"/>
              </div>
            </div>

          </div>
          <nav aria-label="Page nav" className="mx-auto">
            <ul id="stNav" className="pagination justify-content-center"></ul>
          </nav>
          {this.currentStation()}
          <Button id="flyn_toggle" className="fx btn asside btn-md" role="button" onClick={() => $('.flyn').toggleClass('active')}>
            <span className="fx1"></span>
            <span className="fx2"></span>
          </Button>
        </div>
      </div>

      <div className="m-2">
        <Pagination items={this.props.markers} onChangePage={this.onChangePage}/></div>
    </div>);
  }
}
