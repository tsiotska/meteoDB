import React from 'react';
import { mymap } from '../Map/MapComponent';
import { baseUrl } from '../../js/const';
import DatePicker from '../Controls/DatePicker'
import $ from 'jquery';
import { Button, Input } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import CountryItem from '../Elements/CountryItemTemplate';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { connect } from 'react-redux';

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

  componentDidUpdate() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
    this.props.api.getStationsCount()
      .then((data) => {
        if (data && data.response) {
          this.setState({
            source: data.response.map((i) => i.name),
            isLoading: false
          });
          let cnt = 0;
          this.props.setCtrList(data.response.map((i) => {
            return <CountryItem key={cnt++} setQuery={this.setQuery} e={i} />;
          }))
        }
      });
  }

  onSearchClick = () => {
    const {
      markerRequest, polyRequest, queryParam,
      date, years, months, days, offset, limit, neigh, nearest,
    } = this.props;
    //Якщо дозагрузка погоди/Лише для полі і маркера. Без query догрузки
    if (markerRequest || polyRequest) {
      this.props.api.getWeather({
        date,
        years,
        months,
        days,
        polyRequest,
        markerRequest
      }).then((weather) => {
        this.props.setWeather(weather.response);
      }).catch((error) => console.log(error))
    } //Якщо звичайний query запит.
    else if (queryParam) {
      this.props.api.searchStationsByQuery({
        offset,
        limit,
        neigh,
        nearest,
        query: queryParam,
        selectedField: this.selectorByField.current.value
      }).then((stations) => {
        console.log(stations);
        this.props.onStationsData(stations);
      }).catch((error) => console.log(error));

      this.props.api.getPackByQuery({
        offset: offset, limit: limit,
        neighbors: neigh, nearest: nearest,
        query: queryParam,
        selectedField: this.selectorByField.current.value,
        pack: true
      })
        .then((pack) => {
          this.props.setStationPackLink(pack.response[0]);
        }).catch((error) => console.log(error));


      if (years || date.dateSet) {
        this.props.api.getWeatherByQuery({
          date: date, years: years,
          offset: offset, limit: limit,
          neighbors: neigh, nearest: nearest,
          query: queryParam,
          selectedField: this.selectorByField.current.value
        }).then((weather) => {
          this.props.setWeather(weather.response);
        }).catch((error) => console.log(error));

        this.props.api.getPackByQuery({
          date: date,
          years: years,
          months: months,
          days: days,
          offset: offset, limit: limit,
          neighbors: neigh, nearest: nearest,
          query: queryParam,
          selectedField: this.selectorByField.current.value, pack: true
        })
          .then((pack) => {
            console.log(pack)
            this.props.setWeatherPackLink(pack.response[0]);
          }).catch((error) => console.log(error));
      }
    } else {
      alert("Please choose a query...")
    }
  };

  onChangePage = (selectedPage, index) => {
    this.props.PageChanged(selectedPage);
    this.props.mapSelectedIndex(index);
    this.setState({ selectedPage });
  };

  currentStation = () => {
    if (this.props.currentStation) {
      return (<div id="flyn_current_station" className="w-100 d-flex flex-column flyn_current_station">
        {this.props.currentStation}</div>);
    } else return null;
  };

  //Кнопка пошуку активується якщо є пошуковий параметр або виділені полігони з вказаною датою.
  enableButton = () => {
    const { markerRequest, polyRequest, queryParam, date, years, } = this.props;
    if ((queryParam.length > 0) || ((date.dateSet || years) && (polyRequest || markerRequest))) {
      this.setState({ enableSearchButton: true });
    } else {
      this.setState({ enableSearchButton: false })
    }
  };

  clearSource = () => {
    this.props.setQuery([]);
    this.typeahead.getInstance().clear();
    this.enableButton();
  };

  onRefreshClick = () => {
    this.clearSource();
    this.props.lastPoly.forEach((poly) => {
      mymap.removeLayer(poly.layer)
    });

    mymap.setView([
      48.289559, 31.3205566 // Ukraine centered
    ], 6);
    //this.props.setCardItem([]);
    this.props.clearMap();
    this.props.PolySelected("");
    this.props.MarkerSelected("");

    this.enableButton();
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
        this.setState({ source: array });
      }).catch((error) => console.log(error))
    //}
  };

  onOffsetChange = (event) => {
    this.props.setLimiters(event.target.value, "offset")
  };

  onNeighChange = (event) => {
    this.props.setLimiters(event.target.value, "neigh")
  };

  onNearestChange = (event) => {
    this.props.setLimiters(event.target.value, "nearest");
  };

  onLimitChange = (event) => {
    this.props.setLimiters(event.target.value, "limit")
  };

  onYearsChange = async (event) => {
    await this.props.setYears(event.target.value);
    this.enableButton();
  };

  onMonthsChange = async (event) => {
    await this.props.setMonths(event.target.value);
    this.enableButton();
  };

  onDaysChange = async (event) => {
    await this.props.setDays(event.target.value);
    this.enableButton();
  };

  ApplyCalendarDate = async (e) => {
    await this.props.setTime(e);
    this.enableButton();
  };

  unControlledInput = async (searchParam) => {
    await this.props.setQuery(searchParam);
    this.enableButton();
  };

  render() {
    const { areLimitAndOffsetDisabled, counter, stationPackLink, weatherPackLink, polyRequest } = this.props;

    //1. Поправити Typeahead, він скачє.
    //2. Придумати шось з disabledQueryInput class
    return (
      <div className="panel flyn active mr-3 p-0">
        <div className="flyn-inputs-container">
          <div className="form-inline flyn-input-controls">
            <div className="current-database">
              <div className="input-group">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="database-selectors">Database</label>
                </div>
                <select className="custom-select" id="database-selectors">
                  {
                    // TODO: fetch items from API
                    // api/weather/databases
                  }
                  <option defaultValue value="gsod" data-toggle="tooltip" title="Global Summary Of Day (GSOD, NOAA)">GSOD</option>
                  <option disabled value="gh" data-toggle="tooltip" title="Global Hourly dataset (GH, NOAA)">Global Hourly</option>
                  <option disabled value="isd-lite" data-toggle="tooltip" title="Integrated surface data Lite (ISD, NOAA)">ISD Lite</option>
                  <option disabled value="isd" data-toggle="tooltip" title="Integrated surface data FULL (ISD, NOAA)">ISD</option>
                </select>
              </div>
            </div>
            <div className="time-selector-tabs w-100 mx-auto justify-content-center">
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="date-range-tab-top" data-toggle="tab"
                    href="#date-range-tab" role="tab" aria-controls="date-range-tab" aria-selected="true">Dates range</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" id="time-range-tab-top" data-toggle="tab"
                    href="#time-range-tab" role="tab" aria-controls="time-range-tab" aria-selected="false">Vary time selector</a>
                </li>
              </ul>
              <div className="tab-content" id="range-selectors">
                <div className="tab-pane fade show active" id="date-range-tab" role="tabpanel" aria-labelledby="date-range-tab">
                  <div className="d-flex justify-content-center flex-column">
                    <div id="datex" className="mx-auto">
                      <p className="text-center mx-2  mt-2">Aggregates query with date range</p>
                      <DatePicker OnClear={this.ApplyCalendarDate} OnApply={this.ApplyCalendarDate} className="mx-auto d-flex justify-content-center" />
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="time-range-tab" role="tabpanel" aria-labelledby="time-range-tab">
                  <div className="input-group aggregate-selector row justify-content-center d-flex flex-column">
                    <p className="text-center mx-2">Aggregates query with any disperse date items</p>
                    <div id="yearsx" className="mx-auto input-group m-1">
                      <Input type="text" id="years"
                        onChange={this.onYearsChange}
                        className="form-control typeahead"
                        data-toggle="tooltip" data-html="true" data-placement="left" title="<div className='tooltip-info'> Examples: <br>2018-2019<br>2010,2014-2016,2019</div>"
                        placeholder="Years" data-provide="typeahead" />
                    </div>

                    <div id="monthx" className="mx-auto input-group m-1">
                      <Input type="text" id="months"
                        onChange={this.onMonthsChange}
                        className="form-control typeahead"
                        data-toggle="tooltip" data-html="true" data-placement="left" title="<div className='tooltip-info'> Examples: <br>1-10<br>1,3-6,10-12</div>"
                        placeholder="Months" data-provide="typeahead" />
                    </div>

                    <div id="daysx" className="mx-auto input-group m-1">
                      <Input type="text" id="days"
                        onChange={this.onDaysChange}
                        className="form-control typeahead"
                        data-toggle="tooltip" data-html="true" data-placement="left" title="<div className='tooltip-info'> Examples: <br>1-31<br>1,23-26,30</div>"
                        placeholder="Days" data-provide="typeahead" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-inline row top-group">

              <div className="input-group col">
                <div className="input-group-prepend">
                  <label className="input-group-text" htmlFor="exampleCheck1">Field type</label>
                </div>
                {
                  // TODO: fetch values from API
                  // api/gsod/stations/types
                }
                <select defaultValue="ctry_full" className="form-control custom-select" ref={this.selectorByField} disabled={polyRequest}
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

            </div>

            <div className={polyRequest ? "disabledQueryInput" : "input-group  w-100"} >
              <div className={" w-100"}>
                <Typeahead id="typeahead" disabled={polyRequest ? true : false}
                  multiple={true}
                  isLoading={this.state.isLoading}
                  placeholder="Query parameter"
                  onChange={this.unControlledInput}
                  ref={(typeahead) => this.typeahead = typeahead}
                  options={this.state.source} />
              </div>
            </div>

            <div className={polyRequest ? "disabledQueryInput" : "input-group   form-check"}>
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="nbs_chk">With neighbors</label>
              </div>
              <div className="input-group-append">
                <div className="input-group-text">
                  <Input type="checkbox" id="nbs_chk" className="" onChange={this.onNeighChange} />
                </div>
              </div>
            </div>

            <div className={polyRequest ? "disabledQueryInput" : "input-group"}>

              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="exampleCheck1">Nearest N stations</label>
              </div>
              <Input type="text" className="form-control" id="nearest_chk" onChange={this.onNearestChange} />
            </div>

            <div className="form-inline">
              <div className="row">
                <div className="input-group col-6">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Count</span>
                  </div>
                  <Input type="text" id="count" className="form-control typeahead" placeholder="Count"
                    data-provide="typeahead" onChange={this.onLimitChange} disabled={areLimitAndOffsetDisabled} />
                </div>
                <div className="input-group col-6">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Offset</span>
                  </div>
                  <Input type="text" id="offset" className="form-control typeahead" placeholder="Offset"
                    data-provide="typeahead" onChange={this.onOffsetChange} disabled={areLimitAndOffsetDisabled} />
                </div>
              </div>
            </div>

            <div className="col-auto d-flex w-100 justify-content-center">
              <Button id="reeval" onClick={this.onSearchClick}
                color="primary"
                className={(this.state.enableSearchButton ? "" : "disabled ") + "m-2 mb-1 mt-auto"}>Search
              </Button>
              <Button id="refresh" onClick={this.onRefreshClick}
                color="secondary"
                className="m-2 mb-1 mt-auto">Clear
              </Button>
            </div>

          </div>

          {stationPackLink &&
            <Button download target="_blank"
              href={baseUrl + stationPackLink + "?saveas=stations.json"}>
              Stations
          </Button>}

          {weatherPackLink &&
            <Button download target="_blank"
              href={baseUrl + weatherPackLink + "?saveas=weather.json"}>
              Weather
          </Button>}

          {this.currentStation()}
{/* 
          <Button id="flyn_toggle" className="fx btn asside btn-md"
            onClick={() => $('.flyn').toggleClass('active')}>
            <span className="fx1" />
            <span className="fx2" />
          </Button> */}
        </div>
      </div>);
  }
}

const mapStateToProps = state => ({
  polyRequest: state.conditionReducer.polyRequest,
  markerRequest: state.conditionReducer.markerRequest,
  areLimitAndOffsetDisabled: state.conditionReducer.areLimitAndOffsetDisabled,

  lastPoly: state.dataReducer.lastPoly,
  stationPackLink: state.dataReducer.stationPackLink,
  weatherPackLink: state.dataReducer.weatherPackLink,
  queryParam: state.dataReducer.queryParam,
  years: state.dataReducer.years,
  months: state.dataReducer.months,
  days: state.dataReducer.days,
  date: state.dataReducer.date,
  neigh: state.dataReducer.neigh,
  nearest: state.dataReducer.nearest,
  limit: state.dataReducer.limit,
  offset: state.dataReducer.offset
});

const mapDispatchToProps = dispatch => ({
  setQuery: (param) => {
    dispatch({ type: "SET_QUERY", param: param })
  },
  disableLimitAndOffset: (flag) => {
    dispatch({ type: "DISABLE_OFFSET_AND_LIMIT_BUTTON", flag: flag })
  },
  setStationPackLink: (link) => {
    dispatch({ type: "SET_STATION_PACK_LINK", link: link })
  },
  setWeatherPackLink: (link) => {
    dispatch({ type: "SET_WEATHER_PACK_LINK", link: link })
  },
  setYears: (years) => {
    dispatch({ type: "SET_YEARS", years: years })
  },
  setMonths: (months) => {
    dispatch({ type: "SET_MONTHS", months: months })
  },
  setDays: (days) => {
    dispatch({ type: "SET_DAYS", days: days })
  },
  setTime: (date) => {
    dispatch({ type: "SET_TIME", date: date })
  },
  //Працює для  limit offset nearest neigh
  setLimiters: (data, kind) => {
    dispatch({ type: "SET_ANY_INPUT_DATA", data: data, kind: kind })
  },
  PolySelected: (req) => {
    dispatch({ type: "IF_POLY_SELECTED", req: req })
  },
  MarkerSelected: (flag, req) => {
    dispatch({ type: "IF_MARKER_SELECTED", req: req })
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuComponent);
