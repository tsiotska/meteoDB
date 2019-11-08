import React from 'react';
import Map from './Components/Map';
import Pagination from '../../Main/Controls/Pagination';
import {baseUrl} from '../../js/const';
import DatePicker from '../../Main/Controls/DatePicker'
import $ from 'jquery';
import {Button, Input} from 'reactstrap';

import {Typeahead} from 'react-bootstrap-typeahead';
import CountryItem from '../../Main/Elements/CountryItemTemplate';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

var TypeaheadW = require('typeahead'),
  initdate = {
    dateSet: false,
    startDate: null,
    endDate: null
  };

export default class MenuComponent extends React.Component {
  constructor(props) {
    super(props);
    this.axios = null;
    this.s_type = React.createRef();
    this.state = {
      packLink: null,
      offset: null,
      count: null,
      isLoading: true,
      selectedPage: [],
      source: [],
      queryParam: null,
      ctr_list: [],
      lastPoly: null,
      date: initdate,
      enableSearchButton: false
    };
  }

  componentDidMount() {
    this.props.SelTime(this.getSelectedTime.bind(this));
    this.props.api.fetchData(baseUrl + "/api/gsod/countries/stationsCount")
      .then((data) => {
        if (data && data.response) {
          let cnt = 0;
          console.log("COUNTS OF STATION: ");
          console.log(data.response);

          this.setState({
            source: data.response.map((i) => i.name), //.item1
            isLoading: false
          });

          this.props.setCtrList(data.response.map((i) => {
            return <CountryItem key={cnt++} setQuery={this.setQuery} e={i}/>;
          }))
        }
      });
    /* let arr = [{Name: 'hello', Value: 'world'}, {Name: 'world', Value: 'baby'}];
     let cnt = 0;
     this.props.setCtrList(arr.map((i) => {

       return <CountryItem key={cnt++} setQuery={this.setQuery} e={i}/>;
     }))*/
  }

  onSearchClick = () => {
    let isBigDataQuery, neighbors, queryType, polyreq, limit, offset;
    let searchType = this.s_type.current.value;
    let yearTime = ($("#years").val() ? "&year=" + $("#years").val() : '');

    //Якщо взяти з календаря то since until else беремо рік
    let time = this.state.date.dateSet
      ? '&since=' + this.state.date.startDate.format('DD.MM.YYYY') + '&until=' + this.state.date.endDate.format('DD.MM.YYYY')
      : yearTime;

    let names = this.state.queryParam;
    if (names != null) {
      names = (
        typeof names === 'string'
          ? names
          : (this.state.queryParam && this.state.queryParam.join(',')) || this.props.markers.map((i) => {
          return i.data[this.s_type.current.value]
        })
      );
    }

    if (this.state.lastPoly) {
      polyreq = 'poly?type=' + this.getPolyStr();
    } else {
      limit = $('#count').val() || undefined //Це ліміт
      offset = $('#offset').val() || undefined //Це оффсет

      isBigDataQuery = names.toString().includes(',');
      //||(this.state.queryParam && this.state.queryParam.length > 1);

      neighbors = (
        $('#nbs_chk').prop('checked')
          ? '&nbs' : '');

      queryType = (isBigDataQuery ? '&query=' + names : '');
    }

    let queryValue = (polyreq ? polyreq : 'stations?field=' + searchType + queryType + neighbors);

    if (limit !== undefined) {
      queryValue += '&limit=' + limit
    } //offset може бути і без ліміта.
    if (offset !== undefined) {
      queryValue += '&offset=' + offset
    }

    let stationRequest = baseUrl + '/api/gsod/' + queryValue;
    if (yearTime || this.state.date.dateSet) { //Якщо є час, то потрібна і погода!
      this.props.api.fetchData(stationRequest).then((station) => {
        this.props.api.fetchData(stationRequest + time).then((weather) => {
          this.props.onStationsAndWeathersData(station, weather);
        });
      }).catch((error) => {
        console.log(error)
      });
    } else {
      this.props.api.fetchData(stationRequest).then((station) => {
        this.props.onStationsData(station);
      })
    }
  };

  getPolyStr() {
    console.log("SELECTED")
    let polyreq,
      e = this.state.lastPoly.layer,
      lngs = null;
    if (e.options.radius !== undefined) {
      let res = [e._latlng.lat, e._latlng.lng, e.getRadius()];
      polyreq = "circle&value=[" + res + "]";
    } else {
      lngs = e._latlngs;
      var res = lngs.join('],[');
      polyreq = "poly&value=[" + res + "]";
    }
    return polyreq
  }

  componentWillUnmount() {
    // this.axios.abort()
  }

  onChangePage = (selectedPage, index) => {
    this.props.PageChanged(selectedPage);
    this.props.mapSelectedIndex(index);
    this.setState({selectedPage});
  };


  currentStation = () => {
    return (<div id="flyn_current_station" className="w-100 d-flex flex-column">
      {this.props.currentStation}</div>);
  };

  setQuery = (e) => {
    this.s_type.current.value = 'ctry_full';
    $('#querystr').val(e);

    console.log("SetQuery");
    console.log(e);
    this.onSearchClick(e);
  };

  onRefreshClick = (e) => {
    this.props.onRefreshClick(e);
  };


  getSelectedTime() {
    return this.state.date.dateSet
      ? '&since=' + this.state.date.startDate.format('DD.MM.YYYY') + '&until=' + this.state.date.endDate.format('DD.MM.YYYY')
      : (
        $("#years").val()
          ? "&year=" + $("#years").val()
          : '');
  }


  /// HALF PORTED PART FROM JQUERY

  setLastPoly = (e) => {
    this.setState({lastPoly: e})
  };

  onYearsChange = () => {
    if ($("#years").val().length === 4) {
      this.setState({year: $("#years").val()});
      $("#stx .stx_l1").removeClass('fade');
      /* this.props.api.getByTypeAndYear($("#years").val(), this.s_type.current.value).then((data) => {
         TypeaheadW($("#id_st")[0], {source: data.response});
         $("#stx .stx_l1").addClass('fade');
         $('#id_st').removeAttr('readonly');
       });*/
    } else {
      this.setState({year: ""})
    }
  };

  onTypeChanged = (e) => {
    this.s_type.current.value = e.target.value;
    let p = e.target.value;

    if (this.state.year) {
      this.props.api.getByTypeAndYear(this.state.year, this.s_type.current.value)
        .then((data) => {
          console.log(data.response[0]);
          //  this.setState({source: data.response})
        }).catch((error) => console.log(error))
    } else {
      this.props.api.getByType(this.s_type.current.value, this.state.offset, this.state.count)
        .then((data) => {

          //Валідаційна дічь
          let array = data.response.filter((value) => {
            return value[this.s_type.current.value] !== ""
          }).map((i) => {
            return i[this.s_type.current.value];
          });

          array = array.filter(function (item, pos) {
            return array.indexOf(item) === pos;
          });

          console.log(array);
          this.setState({source: array});
        }).catch((error) => console.log(error))
    }
  };

  onOffsetChange = (event) => {
    this.setState({offset: event.target.value})
  };

  onCountChange = (event) => {
    this.setState({count: event.target.value})
  };

  onIdChange = () => {
    console.log("onIdChange");
    if ($("#id_st").val() === 'N/A' || $("#id_st").val().length === 6) {
      $("#stx .stx_l2").removeClass('fade');
      this.state.api.OfYear($("#years").val()).getForId($("#id_st").val()).done((data) => { //2
        TypeaheadW($("#wban_st")[0], {source: data.response});
        $("#stx .stx_l2").addClass('fade');
        $('#wban_st').removeAttr('readonly');
      });
    }
  };

  onWbanChange = () => {
    if ($("#wban_st").val() === 'N/A' || $("#wban_st").val().length === 6) {
      $("#datex .cssload-container").removeClass('fade');
      this.state.api.OfYear($("#years").val()).getForWban($("#id_st").val(), $("#wban_st").val()).then((data) => {
        TypeaheadW($("#date")[0], {source: data.response});
        $("#datex .cssload-container").addClass('fade');
        $('#date').removeAttr('readonly');
      });
    }
  };

  controlledInput = (event) => {
    console.log(event);
    this.setState({queryParam: event});
    if (!event) {
      this.setState({enableSearchButton: false})
    } else {
      this.setState({enableSearchButton: true});
    }
  };


  render() {


    return (<div className="main_map container-fluid p-0">
      <Map api={this.props.api} createPackLink={this.props.createPackLink} activeMarker={this.props.activeMarker}
           OnPolySelected={this.setLastPoly}
           onStationsData={this.props.onStationsData} markers={this.state.selectedPage}
           currentSelected={this.props.markers}/>
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
                <select defaultValue="ctry_full" ref={this.s_type} className="custom-select"
                        onChange={this.onTypeChanged} id="type">
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

                  <input type="text" id="years" onChange={this.onYearsChange} className="form-control typeahead"
                         placeholder="Рік" data-provide="typeahead"/>

                  <div className="cssload-container fade">
                    <div className="cssload-whirlpool"/>
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

                <Typeahead multiple={true} isLoading={this.state.isLoading} placeholder="Пошуковий параметр"
                           onChange={this.controlledInput} options={this.state.source}/>
              </div>


            </div>
            <div className="form-group w-50 ml-4 mb-1 form-check">
              <input type="checkbox" className="form-check-input" id="nbs_chk"/>
              <label className="form-check-label" htmlFor="exampleCheck1">Сусідні країни</label>

            </div>
            <div className="col-auto d-flex w-100">
              <button id="reeval" onClick={this.onSearchClick}
                      className={this.state.enableSearchButton ? "btn btn-primary m-2 mb-1 mt-auto" :
                        "disabled btn btn-primary m-2 mb-1 mt-auto"}>Пошук
              </button>
              <button id="refresh" onClick={this.onRefreshClick}
                      className="btn btn-secondary m-2 mb-1 mt-auto">Очистити
              </button>
            </div>
          </div>

          <div className="form-inline mx-auto">

            <div id="stx" className="col-auto mb-1">
              <label htmlFor="id_st">ID Станції</label>
              <div className="input-group">
                <Input type="text" className="form-control typeahead" id="id_st" onChange={this.onIdChange}
                       placeholder="123456" data-provide="typeahead" readOnly="readOnly"/>
                <div className="stx_l1 cssload-container fade">
                  <div className="cssload-whirlpool"/>
                </div>
              </div>
              <label htmlFor="wban_st">WBAN Станції</label>
              <div className="input-group">
                <Input type="text" className="form-control typeahead" id="wban_st" onChange={this.onWbanChange}
                       placeholder="Станція" value="N/A" data-provide="typeahead" readOnly="readOnly"/>
                <div className="stx_l2 cssload-container fade">
                  <div className="cssload-whirlpool"/>
                </div>
              </div>
            </div>
            <div className="row m-2">
              <div className="input-group  col-6 p-1">
                <div className="input-group-prepend">
                  <span className="input-group-text">Count</span>
                </div>
                <Input type="text" id="count" className="form-control typeahead" placeholder="Count"
                       data-provide="typeahead" onChange={this.onCountChange}/>
              </div>
              <div className="input-group  col-6 p-1">
                <div className="input-group-prepend">
                  <span className="input-group-text">Offset</span>
                </div>
                <Input type="text" id="offset" className="form-control typeahead" placeholder="Offset"
                       data-provide="typeahead" onChange={this.onOffsetChange}/>
              </div>
            </div>
          </div>

          <nav aria-label="Page nav" className="mx-auto">
            <ul id="stNav" className="pagination justify-content-center"/>
          </nav>

          {this.props.readyToDownload &&
          <a download className="" target="_blank" role="button"
             href={"http://192.168.42.185:3001" + this.props.packLink + "?saveas=Stations.json"}>
            СКАЧАЙ МЕНЕ
          </a>}

          {this.currentStation()}
          <Button id="flyn_toggle" className="fx btn asside btn-md" role="button"
                  onClick={() => $('.flyn').toggleClass('active')}>
            <span className="fx1"/>
            <span className="fx2"/>
          </Button>


        </div>
      </div>

      <div className="m-2">
        <Pagination items={this.props.markers} onChangePage={this.onChangePage}/></div>
    </div>);
  }
}
