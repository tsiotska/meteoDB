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
import {connect} from 'react-redux';

let initdate = {
  dateSet: false,
  startDate: null,
  endDate: null
};

class MenuComponent extends React.Component {
  constructor(props) {
    super(props);
    this.axios = null;
    this.s_type = React.createRef();
    this.state = {
      markerRequest: "",
      polyRequest: "",
      year: null,
      packLink: null,
      offset: null,
      limit: null,
      isLoading: true,
      selectedPage: [],
      source: [],
      queryParam: [],
      ctr_list: [],
      lastPoly: null,
      date: initdate,
      enableSearchButton: false
    };
  }

  componentDidMount() {
    this.props.SelTime(this.getSelectedTime.bind(this));
    this.props.api.getStationsCount()
      .then((data) => {
        if (data && data.response) {
          let cnt = 0; 

          this.setState({
            source: data.response.map((i) => i.name), //.item1
            isLoading: false
          });

          this.props.setCtrList(data.response.map((i) => {
            return <CountryItem key={cnt++} setQuery={this.setQuery} e={i}/>;
          }))
        }
      }); 
  }

  setMarkerRequest = (req) => {
    this.setState({markerRequest: req})
  };

  setPolyRequest = (req) => {
    this.setState({polyRequest: req})
  };

  //isPolySelected має пріорітет
  onSearchClick = () => {
    console.log("onSearchCLICK!");  
    this.props.api.WithOptions({...this.state, neighbors: $('#nbs_chk').prop('checked')})
  
    let time = this.getSelectedTime();
    //Єслі виділили маркер/полігон і хочєм погоду
    console.log('isMarkerSelected?');
    console.log(this.props.isMarkerSelected);
    console.log('isPolySelected?');
    console.log(this.props.isPolySelected);

    if  (this.props.isMarkerSelected && time) {
      this.props.api.fetchData(this.state.markerRequest + time).then((weather) => {
        this.props.setWeather(weather.response);
      }).catch((error) => console.log(error));
    } else if (this.props.isPolySelected && time) {
      console.log("We are in POLY processing section!");
      this.props.api.fetchData(this.state.polyRequest + time).then((weather) => {
        this.props.setWeather(weather.response);
      }).catch((error) => console.log(error));
    } else if (this.props.isPolySelected || this.props.isMarkerSelected){
      alert("Nothing to search...")
    }
    //Звичайний запит за типом і query.
    else {
      let neighbors, queryType, polyreq, limit, offset,
        searchType = this.s_type.current.value;
      //Запит або Poly або вручну вбивали
      limit = this.state.limit || undefined;
      offset = this.state.offset || undefined;
      neighbors = (
        $('#nbs_chk').prop('checked')
          ? '&nbs' : '');
      let names = this.state.queryParam;
      queryType = (names ? '&query=' + names : '');


      let queryValue = (polyreq ? polyreq : 'stations?field=' + searchType + queryType + neighbors);

      if (limit !== undefined) {
        queryValue += '&limit=' + limit
      } //offset може бути і без ліміта.
      if (offset !== undefined) {
        queryValue += '&offset=' + offset
      }

      let stationRequest = baseUrl + '/api/gsod/' + queryValue;
      if (/* yearTime || */ this.state.date.dateSet) { //Якщо є час, то потрібна і погода!

        this.props.api.fetchData(stationRequest).then((station) => {
          this.props.onStationsData(station);

          this.props.api.fetchData(stationRequest + time)
            .then((weather) => {
              this.props.setWeather(weather);
            })
            .catch((error) => {
              console.log(error)
            });
        }).catch((error) => {
          console.log(error)
        });


      } else {
        this.props.api.fetchData(stationRequest).then((station) => {
          this.props.onStationsData(station);
        })
      }
    }
  };

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
    this.onSearchClick(e);
  };

  onRefreshClick = (e) => {
    this.props.onRefreshClick(e);
  };

  getSelectedTime() {
    return this.state.date.dateSet
      ? '&since=' + this.state.date.startDate.format('DD.MM.YYYY') + '&until=' + this.state.date.endDate.format('DD.MM.YYYY')
      : (this.state.year ? "&year=" + this.state.year : '');
  }

  enableButton = () => {
    let time = this.getSelectedTime();

    if (this.state.queryParam.length > 0 || (time && this.props.isPolySelected || time && this.props.isMarkerSelected)) {
      this.setState({enableSearchButton: true});
    } else {
      this.setState({enableSearchButton: false})
    }
  };

  onYearsChange = (event) => {
    let year = event.target.value;
    if (year.length === 4) {
      this.setState({year: year});
    } else {
      this.setState({year: ""});
    }
    //Треба юзати сагу/транк
    setTimeout(this.enableButton, 250)
  };

  clearSource = () => {
    //this.setState({source: [], queryParam: []});
    this.typeahead.getInstance().clear();
  };

  onTypeChanged = () => {
    this.clearSource();
    let type = this.s_type.current.value;
    //disable limit and offset 
    
    this.props.disableLimitAndOffset(type === "stname" || type === "id" || type === "wban"); 

    if (this.state.year) {
      this.props.api.getByTypeAndYear(this.state.year, this.s_type.current.value)
        .then((data) => {
          console.log(data.response[0]);
          //  this.setState({source: data.response})
        }).catch((error) => console.log(error))
    } else {
      this.props.api.getByType(this.s_type.current.value, this.state.offset, this.state.limit)
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

  onLimitChange = (event) => {
    this.setState({limit: event.target.value})
  };

  ApplyCalendarDate = (e) => {
    this.setState({date: e});
    setTimeout(this.enableButton, 250);
  };

  unControlledInput = (searchParam) => {
    this.setState({queryParam: searchParam});
    setTimeout(this.enableButton, 500);
  };

  render() {
    //Це деструктуризація, можеш писати її ще зі стейтом
    const {areLimitAndOffsetDisabled, counter, readyToDownload, packLink, markers} = this.props;

    return (<div className="main_map container-fluid p-0">
      <Map setPolyRequest={this.setPolyRequest} setWeather={this.props.setWeather}
           getSelectedTime={this.getSelectedTime.bind(this)}
           clearMarkers={this.props.clearMarkers} api={this.props.api}
           createPackLink={this.props.createPackLink} activeMarker={this.props.activeMarker}
           onStationsData={this.props.onStationsData} markers={this.state.selectedPage}
           currentSelected={this.props.markers} setCardItem={this.props.setCardItem}/>

      <div className="cur_count_wrapper">
        <div className={"cur_count " + (
          counter
            ? ""
            : "fade")} id="result-info">{counter}</div>
      </div>
      <div className="panel flyn active  card card-body">
        <div className="scrollable">
          <div className="form-inline ">

            <div className="form-inline row m-1">

              <div className="col-5  mb-1">
                <label htmlFor="type">Тип поля</label>
                <select defaultValue="ctry_full" ref={this.s_type} disabled={this.props.isPolySelected}
                        className="custom-select"
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
                <DatePicker OnClear={(e) => this.setState({date: e})} OnApply={this.ApplyCalendarDate}/>
              </div>
            </div>
            <div className="col-auto mb-1">
              <label htmlFor="querystr">Пошуковий параметр</label>
              <div className={"input-group"}>

                <Typeahead disabled={false} multiple={true} isLoading={this.state.isLoading} placeholder="Пошуковий параметр"
                           onChange={this.unControlledInput} ref={(typeahead) => this.typeahead = typeahead}
                           options={this.state.source}/>
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
            <div className="row m-2">
              <div className="input-group  col-6 p-1">
                <div className="input-group-prepend">
                  <span className="input-group-text">Count</span>
                </div>
                <Input type="text" id="count" className="form-control typeahead" placeholder="Count"
                       data-provide="typeahead" onChange={this.onLimitChange} disabled={areLimitAndOffsetDisabled}/>
              </div>
              <div className="input-group  col-6 p-1">
                <div className="input-group-prepend">
                  <span className="input-group-text">Offset</span>
                </div>
                <Input type="text" id="offset" className="form-control typeahead" placeholder="Offset"
                       data-provide="typeahead" onChange={this.onOffsetChange} disabled={areLimitAndOffsetDisabled}/>
              </div>
            </div>
          </div>

          <nav aria-label="Page nav" className="mx-auto">
            <ul id="stNav" className="pagination justify-content-center"/>
          </nav>

          {readyToDownload &&
          <button download className="" target="_blank" role="button"
             href={baseUrl + packLink + "?saveas=stations.json"}>
            Download
          </button>}

          {this.currentStation()}

          <Button id="flyn_toggle" className="fx btn asside btn-md" role="button"
                  onClick={() => $('.flyn').toggleClass('active')}>
            <span className="fx1"/>
            <span className="fx2"/>
          </Button>
        </div>
      </div>

      <div className="m-2">
        <Pagination items={markers} onChangePage={this.onChangePage}/></div>
    </div>);
  }
}

const mapStateToProps = state => ({
  isPolySelected: state.conditionReducer.isPolySelected,
  isMarkerSelected: state.conditionReducer.isMarkerSelected,
  areLimitAndOffsetDisabled: state.conditionReducer.areLimitAndOffsetDisabled,
});

const mapDispatchToProps = dispatch => ({
  disableLimitAndOffset: (flag) => {
    dispatch({type: "DISABLE_OFFSET_AND_LIMIT_BUTTON", flag: flag})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuComponent);