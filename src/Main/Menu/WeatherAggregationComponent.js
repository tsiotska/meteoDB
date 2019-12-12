import React from "react";
import DatePicker from '../Controls/DatePicker';
import {Button, Input} from "reactstrap";
import {connect} from "react-redux";

class WeatherAggregationComponent extends React.Component {
  state = {enableWeatherSearchButton: false};

  //Не можна прокидати тєкущі limit, offset, бо користувач міг їх змінити. Використовуємо збережений req
  onWeatherSearchClick = () => {
    const {
      polyRequest, markerRequest, queryRequest, offset, limit, neigh,
      nearest, days, months, date, years, api,
    } = this.props;

    if (years || months || days || date.dateSet) {
      if (markerRequest) {

        api.getWeather({
          date, years,
          months, days,
          markerRequest
        }).then((weather) => {
          this.props.setWeatherForOneStation(weather.response);
        }).catch((error) => console.log(error))

        //passing payload as polyRequest
      } else if (polyRequest) {
        api.getWeatherByGeoJson(polyRequest).then((weather) => {
          console.log(weather);
          this.props.onWeatherData(weather.response);
        }).catch((error) => console.log(error))
      } else {
        api.getWeather({
          date, years, months, days,
          queryRequest
        }).then((weather) => {
          this.props.onWeatherData(weather.response);
        }).catch((error) => console.log(error));

      }

      /* this.props.api.getPackByQuery({
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
         */
    } else {
      alert("Please select date!")
    }
  };
  enableButton = () => {
    const {date, days, months, years} = this.props;
    if (date.dateSet || (years || months || days)) {
      this.setState({enableWeatherSearchButton: true});
    } else {
      this.setState({enableWeatherSearchButton: false})
    }
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
    if (e.dateSet)
      this.setState({enableWeatherSearchButton: true});
    else {
      this.setState({enableWeatherSearchButton: false})
    }
  };

  render() {
    const {onDaysChange, onYearsChange, onMonthsChange,} = this.props;
    return (<div className={"" + this.props.className}>
      <h2>Aggregate weather</h2>
      <div className="time-selector-tabs w-100 mx-auto justify-content-center">
        <ul className="nav nav-tabs" id="myTab" role="tablist">
          <li className="nav-item">
            <a className="nav-link active" id="date-range-tab-top" data-toggle="tab"
               href="#date-range-tab" role="tab" aria-controls="date-range-tab" aria-selected="true">Dates range</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" id="time-range-tab-top" data-toggle="tab"
               href="#time-range-tab" role="tab" aria-controls="time-range-tab" aria-selected="false">Vary time
              selector</a>
          </li>
        </ul>

        <div className="tab-content" id="range-selectors">
          <div className="tab-pane fade show active" id="date-range-tab" role="tabpanel"
               aria-labelledby="date-range-tab">
            <div className="d-flex justify-content-center flex-column">
              <div id="datex" className="mx-auto">
                <p className="text-center mx-2  mt-2">Aggregates query with date range</p>
                <DatePicker OnClear={this.ApplyCalendarDate} OnApply={this.ApplyCalendarDate}
                            className="mx-auto d-flex justify-content-center"/>
              </div>
            </div>
          </div>

          <div className="tab-pane fade" id="time-range-tab" role="tabpanel" aria-labelledby="time-range-tab">
            <div className="input-group aggregate-selector row justify-content-center d-flex flex-column">
              <p className="text-center mx-2">Aggregates query with any disperse date items</p>
              <div id="yearsx" className="mx-auto input-group m-1">
                <Input type="text" id="years"
                       onChange={onYearsChange}
                       className="form-control typeahead"
                       data-toggle="tooltip" data-html="true" data-placement="left"
                       title="<div className='tooltip-info'> Examples: <br>2018-2019<br>2010,2014-2016,2019</div>"
                       placeholder="Years" data-provide="typeahead"/>
              </div>

              <div id="monthx" className="mx-auto input-group m-1">
                <Input type="text" id="months"
                       onChange={onMonthsChange}
                       className="form-control typeahead"
                       data-toggle="tooltip" data-html="true" data-placement="left"
                       title="<div className='tooltip-info'> Examples: <br>1-10<br>1,3-6,10-12</div>"
                       placeholder="Months" data-provide="typeahead"/>
              </div>

              <div id="daysx" className="mx-auto input-group m-1">
                <Input type="text" id="days"
                       onChange={onDaysChange}
                       className="form-control typeahead"
                       data-toggle="tooltip" data-html="true" data-placement="left"
                       title="<div className='tooltip-info'> Examples: <br>1-31<br>1,23-26,30</div>"
                       placeholder="Days" data-provide="typeahead"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-auto d-flex w-100 justify-content-center">
        <Button id="reeval" onClick={this.onWeatherSearchClick}
                color="primary"
                className={(this.state.enableWeatherSearchButton ? "" : "disabled ") + "m-2 mb-1 mt-auto"}>Search
        </Button>
      </div>
    </div>);
  }
}

const mapStateToProps = state => ({
  polyRequest: state.conditionReducer.polyRequest,
  markerRequest: state.conditionReducer.markerRequest,
  queryRequest: state.conditionReducer.queryRequest,

  stationPackLink: state.dataReducer.stationPackLink,
  weatherPackLink: state.dataReducer.weatherPackLink,

  years: state.dataReducer.years,
  months: state.dataReducer.months,
  days: state.dataReducer.days,
  date: state.dataReducer.date,
});

const mapDispatchToProps = dispatch => ({
  setStationPackLink: (link) => {
    dispatch({type: "SET_STATION_PACK_LINK", link: link})
  },
  setWeatherPackLink: (link) => {
    dispatch({type: "SET_WEATHER_PACK_LINK", link: link})
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
});

export default connect(mapStateToProps, mapDispatchToProps)(WeatherAggregationComponent)
