import React from 'react';
import {mymap} from '../Map/MapComponent';
import {baseUrl, classJoin} from '../../js/const';
import $ from 'jquery';
import {Button} from 'reactstrap';
import CountryItem from '../Elements/CountryItemTemplate';
import StationSearchBar from './searchBars/stationSearchBar';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import {connect} from 'react-redux';

class StationsQueryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.axios = null;
    this.selectorByField = React.createRef();
    this.state = {
      isLoading: true,
      selectedPage: [],
      source: [],
      ctr_list: [],
      enableSearchButton: false
    };
    this.typeahead = React.createRef();
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
            return <CountryItem key={cnt++} onSearchClick={this.onStationsSearchClick}
                                onRefreshClick={this.onRefreshClick}
                                setQuery={this.props.setQuery} e={i}/>;

          }))
        }
      });
  }

  onStationPackClick = () => {
    const {api, queryRequest, markerRequest, polyPayload} = this.props;

    if (polyPayload) {
      api.getPackByGeoJson({
        polyPayload,
        pack: true
      }).then((pack) => {  console.log(pack.response[0]);
        console.log("Redirect to " + baseUrl + pack.response[0] + "?saveas=stations.json");
        window.location.replace(baseUrl + pack.response[0] + "?saveas=stations.json")
      })
        .catch((error) => console.log(error));
    } else {
      api.getPack({
        queryRequest, markerRequest,
        pack: true
      }).then((pack) => {  console.log(pack.response[0]);
        console.log("Redirect to " + baseUrl + pack.response[0] + "?saveas=stations.json");
        window.location.replace(baseUrl + pack.response[0] + "?saveas=stations.json")
      })
        .catch((error) => console.log(error));
    }
  };


  onStationsSearchClick = () => {
    const {queryParam, offset, limit, neigh, nearest, api, QueryRequest} = this.props;
    console.log(api.buildQueryRequest({
      offset, limit, neigh,
      nearest, queryParam,
      selectedField: this.selectorByField.current.value
    }));
    let link = api.buildQueryRequest({
      offset, limit, neigh,
      nearest, queryParam,
      selectedField: this.selectorByField.current.value
    });
    console.log(link);
    QueryRequest(link);


    api.searchStationsByQuery({
      offset, limit, neigh,
      nearest, queryParam,
      selectedField: this.selectorByField.current.value
    }).then((stations) => {
      console.log(stations);
      this.props.onStationsSelection(stations);
    }).catch((error) => console.log(error));
  };

  onChangePage = (selectedPage, index) => {
    this.props.PageChanged(selectedPage);
    this.props.mapSelectedIndex(index);
    this.setState({selectedPage});
  };

  currentStation = () => {
    if (this.props.selectedStation) {
      return (<div id="flyn_current_station" className="w-100 d-flex flex-column flyn_current_station">
        {this.props.selectedStation}</div>);
    } else return null;
  };

//Кнопка пошуку активується якщо є пошуковий параметр або виділені полігони з вказаною датою.
  enableButton = () => {

    const {queryParam} = this.props;
    if ((queryParam.length > 0)) {
      this.setState({enableSearchButton: true});
    } else {
      this.setState({enableSearchButton: false})
    }
  };

  changeInputRef = (typeahead) => {
    this.typeahead = typeahead
  };

  clearSource = () => {
    this.props.refreshSearchParams();
    this.typeahead.getInstance().clear();
    this.enableButton();
  };

  onRefreshClick = () => {
    this.props.polygons.forEach((poly) => {
      mymap.removeLayer(poly.layer)
    });

    this.clearSource();

    mymap.setView([
      48.289559, 31.3205566 // Ukraine centered
    ], 6);

    //this.props.setCardItem([]);
    this.enableButton();
  };

  onTypeChanged = () => {
    this.clearSource();
    let type = this.selectorByField.current.value;

    this.props.disableLimitAndOffset(type === "stname" || type === "id" || type === "wban");

    this.props.api.getByType(this.selectorByField.current.value, this.state.offset, this.state.limit)
      .then((data) => {
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

  unControlledInput = async (searchParam) => {
    await this.props.setQuery(searchParam);
    this.enableButton();
  };

  render() {
    const {stations} = this.props;

    let toStationsBar = {
      areLimitAndOffsetDisabled: this.props.areLimitAndOffsetDisabled,
      ApplyCalendarDate: this.ApplyCalendarDate,
      onDaysChange: this.onDaysChange,
      onYearsChange: this.onYearsChange,
      onTypeChanged: this.onTypeChanged,
      onLimitChange: this.onLimitChange,
      onMonthsChange: this.onMonthsChange,
      onOffsetChange: this.onOffsetChange,
      onNearestChange: this.onNearestChange,
      onNeighChange: this.onNeighChange,
      polyPayload: this.props.polyPayload,
      selectorByField: this.selectorByField,
      changeInputRef: this.changeInputRef,
      isLoading: this.state.isLoading,
      source: this.state.source,
      unControlledInput: this.unControlledInput
    };
    return (<div className={classJoin(this.props.className)}>
      <h2>Query stations</h2>
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
                  <option defaultValue value="gsod" data-toggle="tooltip"
                          title="Global Summary Of Day (GSOD, NOAA)">GSOD
                  </option>
                  <option disabled value="gh" data-toggle="tooltip" title="Global Hourly dataset (GH, NOAA)">Global
                    Hourly
                  </option>
                  <option disabled value="isd-lite" data-toggle="tooltip"
                          title="Integrated surface data Lite (ISD, NOAA)">ISD Lite
                  </option>
                  <option disabled value="isd" data-toggle="tooltip"
                          title="Integrated surface data FULL (ISD, NOAA)">ISD
                  </option>
                </select>
              </div>
            </div>

            <StationSearchBar ref={this.typeahead} {...toStationsBar} />

            <div className="col-auto d-flex w-100 justify-content-center">
              <Button id="reeval" onClick={this.state.enableSearchButton && this.onStationsSearchClick}
                      color="primary"
                      className={(this.state.enableSearchButton ? "" : "disabled ") + "m-2 mb-1 mt-auto"}>Search
              </Button>

              <Button id="refresh" onClick={this.onRefreshClick}
                      color="secondary"
                      className="m-2 mb-1 mt-auto">Clear
              </Button>
            </div>

          </div>


          {stations.length > 0 &&
          <Button onClick={this.onStationPackClick}>
            Stations
          </Button>}


          {this.currentStation()}
          {/*
          <Button id="flyn_toggle" className="fx btn asside btn-md"
            onClick={() => $('.flyn').toggleClass('active')}>
            <span className="fx1" />
            <span className="fx2" />
          </Button> */}
        </div>
      </div>
    </div>);
  }
}

const mapStateToProps = state => ({
  polyPayload: state.dataReducer.polyPayload,
  markerRequest: state.dataReducer.markerRequest,
  queryRequest: state.dataReducer.queryRequest,

  areLimitAndOffsetDisabled: state.dataReducer.areLimitAndOffsetDisabled,

  queryParam: state.dataReducer.queryParam,
  neigh: state.dataReducer.neigh,
  nearest: state.dataReducer.nearest,
  limit: state.dataReducer.limit,
  offset: state.dataReducer.offset,

  years: state.dataReducer.years,
  months: state.dataReducer.months,
  days: state.dataReducer.days,
  date: state.dataReducer.date,

  selectedStation: state.dataReducer.selectedStation,
  polygons: state.dataReducer.polygons,
  stations: state.dataReducer.stations,

});

const mapDispatchToProps = dispatch => ({
  setQuery: (param) => {
    dispatch({type: "SET_QUERY", param: param})
  },
  disableLimitAndOffset: (flag) => {
    dispatch({type: "DISABLE_OFFSET_AND_LIMIT_BUTTON", flag: flag})
  },
  setYears: (years) => {
    dispatch({type: "SET_YEARS", years: years})
  },
  setMonths: (months) => {
    dispatch({type: "SET_MONTHS", months: months})
  },
  setDays: (days) => {
    dispatch({type: "SET_DAYS", days: days})
  },
  setTime: (date) => {
    dispatch({type: "SET_TIME", date: date})
  },
  //Працює для  limit offset nearest neigh
  setLimiters: (data, kind) => {
    dispatch({type: "SET_ANY_INPUT_DATA", data: data, kind: kind})
  },
  PolySelected: (req) => {
    dispatch({type: "SET_POLY_SELECTED", req: req})
  },
  MarkerSelected: (flag, req) => {
    dispatch({type: "SET_MARKER_REQUEST", req: req})
  },
  QueryRequest: (req) => {
    dispatch({type: "SET_QUERY_REQUEST", req: req})
  },
  setPolygons: (polygons) => {
    dispatch({type: "SET_POLYGONS", polygons: polygons})
  },
  refreshSearchParams: () => {
    dispatch({type: "REFRESH_EVERYTHING"})
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(StationsQueryComponent);
