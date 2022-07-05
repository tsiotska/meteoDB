import React from "react";
import DatePicker from '../Controls/DatePicker';
import { Button, Input } from "reactstrap";
import { connect } from "react-redux";
import { baseUrl } from "../../js/const";

class WeatherAggregationComponent extends React.Component {

  //Не можна прокидати тєкущі limit, offset, бо користувач міг їх змінити. Використовуємо збережений req
  onWeatherSearchClick = () => {
    const {
      polyPayload, markerRequest, queryRequest,/* offset, limit, neigh,
      nearest,*/ days, months, date, years, api,
    } = this.props;


    if (markerRequest) {
      api.getWeather({
        date, years,
        months, days,
        markerRequest
      }).then((weather) => {
        //Якщо клікнутий маркер, то попередня вибірка погоди не додається
        this.props.setWeatherForOneStation(weather.response);
      }).catch((error) => console.log(error))

    } else if (polyPayload) {
      api.getWeatherByGeoJson({
        date, years,
        months, days, polyPayload
      })
        .then((weather) => {
          console.log(weather);
          this.props.onWeatherData(weather.response);
        }).catch((error) => console.log(error))
    } else {
      api.getWeather({
        date, years, months, days,
        queryRequest
      })
        .then((weather) => {
          this.props.onWeatherData(weather.response);
        }).catch((error) => console.log(error));
    }
  };

  onWeatherPackClick = () => {
    // href={baseUrl + stationPackLink + "?saveas=stations.json"}
    const {api, queryRequest, markerRequest, polyPayload, days, months, date, years} = this.props;

    if (polyPayload) {
      api.getPackByGeoJson({
        polyPayload, days, months, date, years,
        pack: true
      })
        .then((pack) => {
          console.log(pack.response[0]);
          console.log("Redirect to " + baseUrl + pack.response[0] + "?saveas=weather.json");
          window.location.replace(baseUrl + pack.response[0] + "?saveas=weather.json")
        })
        .catch((error) => console.log(error));
    } else {

      api.getPack({
        queryRequest, markerRequest, days, months,
        date, years,
        pack: true
      })
        .then((pack) => {
          console.log(pack.response[0]);
          console.log("Redirect to " + baseUrl + pack.response[0] + "?saveas=weather.json");
          window.location.replace(baseUrl + pack.response[0] + "?saveas=weather.json")
        })
        .catch((error) => console.log(error));
    }
  };

  clearWeather = () => {
    this.props.setWeather([]);
    this.props.setTime({
      dateSet: false,
      startDate: null,
      endDate: null
    });
  };

  enableButton = () => {
    const {date, days, months, years} = this.props;

    if (date.dateSet || (years.length === 4 || months || days)) {
      this.props.enableSearchButton(true);
    } else {
      this.props.enableSearchButton(false);
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

  setDateRange = async (event) => {
    await this.props.setTime(event.target.value);
    this.enableButton();
  };

  render() {
    const {weather} = this.props;

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
                <DatePicker setTime={this.setDateRange} className="mx-auto d-flex justify-content-center"/>
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
                       data-toggle="tooltip" data-html="true" data-placement="left"
                       title="<div className='tooltip-info'> Examples: <br>2018-2019<br>2010,2014-2016,2019</div>"
                       placeholder="Years" data-provide="typeahead"/>
              </div>

              <div id="monthx" className="mx-auto input-group m-1">
                <Input type="text" id="months"
                       onChange={this.onMonthsChange}
                       className="form-control typeahead"
                       data-toggle="tooltip" data-html="true" data-placement="left"
                       title="<div className='tooltip-info'> Examples: <br>1-10<br>1,3-6,10-12</div>"
                       placeholder="Months" data-provide="typeahead"/>
              </div>

              <div id="daysx" className="mx-auto input-group m-1">
                <Input type="text" id="days"
                       onChange={this.onDaysChange}
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
                className={(this.props.enableWeatherSearchButton ? "" : "disabled ") + "m-2 mb-1 mt-auto"}>Search
        </Button>

        <Button id="refresh" onClick={this.clearWeather}
                color="secondary"
                className="m-2 mb-1 mt-auto">а я видаляю погоду...
        </Button>
      </div>

      <div>
        {weather.length > 0 &&
        <Button onClick={this.onWeatherPackClick}>
          Weather
        </Button>}
      </div>

    </div>);
  }
}

const mapStateToProps = state => ({
  polyPayload: state.dataReducer.polyPayload,
  markerRequest: state.dataReducer.markerRequest,
  queryRequest: state.dataReducer.queryRequest,
  enableWeatherSearchButton: state.dataReducer.enableWeatherSearchButton,

  weatherPackLink: state.dataReducer.weatherPackLink,

  years: state.dataReducer.years,
  months: state.dataReducer.months,
  days: state.dataReducer.days,
  date: state.dataReducer.date,

  weather: state.dataReducer.weather,
});

const mapDispatchToProps = dispatch => ({
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
  setWeather: (weather) => {
    dispatch({type: "SET_WEATHER", weather: weather})
  },
  enableSearchButton: (flag) => {
    dispatch({type: "ENABLE_WEATHER_SEARCH_BUTTON", flag: flag})
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(WeatherAggregationComponent)
