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

class MenuComponent extends React.Component {
  constructor(props) {
    super(props);
    this.axios = null;
    this.selectorByField = React.createRef();
    this.state = {
      markerRequest: "",
      polyRequest: "",
      offset: null,
      limit: null,
      isLoading: true,
      selectedPage: [],
      source: [],
      ctr_list: [],
      lastPoly: null,
      enableSearchButton: false
    };
  }

  componentDidMount() {
    /* this.props.SelTime(this.getSelectedTime.bind(this)); */
    this.props.api.getStationsCount()
      .then((data) => {
        if (data && data.response) {
          this.setState({
            source: data.response.map((i) => i.name), //.item1
            isLoading: false
          });
          let cnt = 0;
          this.props.setCtrList(data.response.map((i) => {
            return <CountryItem key={cnt++} setQuery={this.setQuery} e={i}/>;
          }))
        }
      });
  }

  setPolyRequest = (req) => {
    this.setState({polyRequest: req})
  };

  onSearchClick = () => {
    const {
      isPolySelected, isMarkerSelected, markerRequest, polyRequest, queryParam,
      date, year, offset, limit, neigh, nearest,
    } = this.props;
    //Якщо дозагрузка погоди
    if (isMarkerSelected || isPolySelected) {
      this.props.api.uploadWeather({
        date: date, year: year, offset: offset,
        limit: limit, neighbors: this.neigh,
        nearest: nearest,
        isMarkerSelected: isMarkerSelected,
        isPolySelected: isPolySelected,
        polyRequest: polyRequest, markerRequest: markerRequest
      }).then((weather) => {
        this.props.setWeather(weather.response);
      }).catch((error) => console.log(error))
    } //Якщо повністю новий запит
    else if (queryParam) {
      this.props.api.searchStationsByQuery({
        date: date, year: year,
        offset: offset, limit: limit,
        neighbors: neigh, nearest: nearest,
        query: queryParam,
        selectedField: this.selectorByField.current.value,
      }).then((stations) => {
        console.log(stations);
        this.props.onStationsData(stations);
      }).catch((error) => console.log(error));

      if (this.props.api.YieldsToWeatherRequest()) {
        this.props.api.getWeatherByQuery().then((weather) => {
          this.props.setWeather(weather);
        }).catch((error) => console.log(error));
      }
    } else {
      alert("Please choose a query...")
    }
  };

  onChangePage = (selectedPage, index) => {
    this.props.PageChanged(selectedPage);
    this.props.mapSelectedIndex(index);
    this.setState({selectedPage});
  };

  currentStation = () => {
    return (<div id="flyn_current_station" className="w-100 d-flex flex-column flyn_current_station">
      {this.props.currentStation}</div>);
  };

  setQuery = (e) => {
    this.selectorByField.current.value = 'ctry_full';
    $('#querystr').val(e);
    this.onSearchClick(e);
  };

  onRefreshClick = (e) => {
    this.props.onRefreshClick(e);
  };

  enableButton = () => {
    const {isPolySelected, isMarkerSelected, queryParam, date, year} = this.props;

    console.log(queryParam);
    console.log(year)
    if (queryParam || ((date.dateSet || year) && (isPolySelected || isMarkerSelected))) {
      this.setState({enableSearchButton: true});
    } else {
      this.setState({enableSearchButton: false})
    }
  };

  onYearsChange = (event) => {

    console.log("ON YEAR");
    console.log(event);
    this.props.setYear(event.target.value);

    let year = event.target.value;

    if (year.length === 4) {
      this.setState({year: year});
    } else {
      this.setState({year: ""});
    }
    setTimeout(this.enableButton, 500)
  };

  clearSource = () => {
    this.props.setQuery([]);
    this.typeahead.getInstance().clear();
  };

  onTypeChanged = () => {
    this.clearSource();
    let type = this.selectorByField.current.value;
    //disable limit and offset
    this.props.disableLimitAndOffset(type === "stname" || type === "id" || type === "wban");

    /* if (this.props.year) {
       this.props.api.getByTypeAndYear(this.props.year, this.selectorByField.current.value)
         .then((data) => {
           console.log(data.response[0]);
           //  this.setState({source: data.response})
         }).catch((error) => console.log(error))
     } else {*/
    this.props.api.getByType(this.selectorByField.current.value, this.state.offset, this.state.limit)
      .then((data) => {

        //Валідаційна дічь
        let array = data.response.filter((value) => {
          return value[this.selectorByField.current.value] !== ""
        }).map((i) => {
          return i[this.selectorByField.current.value];
        });

        array = array.filter(function (item, pos) {
          return array.indexOf(item) === pos;
        });

        console.log(array);
        this.setState({source: array});
      }).catch((error) => console.log(error))
    //}
  };

  onOffsetChange = (event) => {
    this.props.setOffset(event.target.value)
  };

  onNeighChange = (event) => {
    this.props.setNeigh(event.target.value)
  };

  onNearestChange = (event) => {
    this.props.setNearest(event.target.value);
  };

  onLimitChange = (event) => {
    this.props.setLimit(event.target.value)
  };
//Ось ці функції треба переписати на сагу, бо кнопка буде disabled
  ApplyCalendarDate = (e) => {
    this.props.setTime(e);
    setTimeout(this.enableButton, 500);
  };

  unControlledInput = (searchParam) => {
    this.props.setQuery(searchParam);
    this.setState({queryParam: searchParam});
    setTimeout(this.enableButton, 500);
  };

  render() {
    //Це деструктуризація, пиши якщо багато даних
    const {areLimitAndOffsetDisabled, counter, readyToDownload, packLink} = this.props;

    return (<div className="main_map container-fluid p-0">
      <Map setPolyRequest={this.setPolyRequest} setWeather={this.props.setWeather}
           clearMarkers={this.props.clearMarkers} api={this.props.api}
           activeMarker={this.props.activeMarker}
           onStationsData={this.props.onStationsData} markers={this.state.selectedPage}
           currentSelected={this.props.markers} clearWeather={this.props.clearWeather}
           setCardItem={this.props.setCardItem}/>

      <div className="cur_count_wrapper">
        <div className={"cur_count " + (
          counter
            ? ""
            : "fade")} id="result-info">{counter}</div>
      </div>
      <div className="panel flyn active  card card-body">
        <div className="flyn-inputs-container scrollable">


          {/*       <div class="flyn-grid container d-flex">
        <div class="col-sm-12 col-md-12">
          <div class="flyn-region"></div>
        </div>
        <div class="col-sm-12 col-md-12">
          <div class="flyn-region"></div>
        </div>
        <div class="col-sm-12 col-md-12">
          <div class="flyn-region"></div>
        </div>
      </div> */}

          <div className="form-inline ">
            <div className="form-inline row m-1">
              <div className="col-5  mb-1">
                <label htmlFor="type">Тип поля</label>
                <select defaultValue="ctry_full" ref={this.selectorByField} disabled={this.props.isPolySelected}
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
                  <input type="text" id="years"
                         onChange={this.onYearsChange}
                         className="form-control typeahead"
                         placeholder="Рік" data-provide="typeahead"/>
                  <div className="cssload-container fade">
                    <div className="cssload-whirlpool"/>
                  </div>
                </div>
              </div>

              <div id="datex" className="col-auto  mb-1 ">
                <DatePicker OnClear={this.ApplyCalendarDate} OnApply={this.ApplyCalendarDate}/>
              </div>
            </div>
            <div className="col-auto mb-1">
              <label htmlFor="querystr">Пошуковий параметр</label>
              <div className={"input-group"}>
                <Typeahead disabled={false} multiple={true} isLoading={this.state.isLoading}
                           placeholder="Пошуковий параметр"
                           onChange={this.unControlledInput} ref={(typeahead) => this.typeahead = typeahead}
                           options={this.state.source}/>
              </div>
            </div>
            <div className="form-group w-50 ml-4 mb-1 form-check">

              <input type="checkbox" className="form-check-input" id="nbs_chk" onChange={this.onNeighChange}/>
              <label className="form-check-label" htmlFor="exampleCheck1">Сусідні країни</label>

            </div>
            <div className="form-group w-50 ml-4 mb-1 form-check">
              <input type="text" className="form-check-input" id="nearest_chk" onChange={this.onNearestChange}/>
              <label className="form-check-label" htmlFor="exampleCheck1">Найближчі N станцій</label>
            </div>

            <div className="col-auto d-flex w-100">
              <button id="reeval" onClick={this.onSearchClick}
                      className={(this.state.enableSearchButton ? "" : "disabled ") + "btn btn-primary m-2 mb-1 mt-auto"}>Пошук
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

          {packLink &&
          <Button download className="" target="_blank"
                  href={baseUrl + packLink + "?saveas=stations.json"}>
            Download
          </Button>}

          {this.currentStation()}

          <Button id="flyn_toggle" className="fx btn asside btn-md"
                  onClick={() => $('.flyn').toggleClass('active')}>
            <span className="fx1"/>
            <span className="fx2"/>
          </Button>
        </div>
      </div>

    </div>);
  }
}

const mapStateToProps = state => ({
  polyRequest: state.conditionReducer.polyRequest,
  markerRequest: state.conditionReducer.markerRequest,
  isPolySelected: state.conditionReducer.isPolySelected,
  isMarkerSelected: state.conditionReducer.isMarkerSelected,
  areLimitAndOffsetDisabled: state.conditionReducer.areLimitAndOffsetDisabled,
  packLink: state.dataReducer.currentPackLink,
  queryParam: state.dataReducer.queryParam,
  year: state.dataReducer.year,
  date: state.dataReducer.date,
});

const mapDispatchToProps = dispatch => ({
  setQuery: (param) => {
    dispatch({type: "SET_ANY_INPUT_DATA", param: param})
  },
  disableLimitAndOffset: (flag) => {
    dispatch({type: "DISABLE_OFFSET_AND_LIMIT_BUTTON", flag: flag})
  },
  setPackLink: (link) => {
    dispatch({type: "SET_PACK_LINK", link: link})
  },
  setYear: (year) => {
    dispatch({type: "SET_YEAR", year: year})
  },
  setTime: (date) => {
    dispatch({type: "SET_TIME", date: date})
  },
  //Відрізняються лише параметри, спрощу в одну якшо можливо
  setLimit: (limit) => {
    dispatch({type: "SET_ANY_INPUT_DATA", limit: limit})
  },
  setOffset: (offset) => {
    dispatch({type: "SET_ANY_INPUT_DATA", offset: offset})
  },
  setNearest: (nearest) => {
    dispatch({type: "SET_ANY_INPUT_DATA", nearest: nearest})
  },
  setNeigh: (neigh) => {
    dispatch({type: "SET_ANY_INPUT_DATA", neigh: neigh})
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuComponent);