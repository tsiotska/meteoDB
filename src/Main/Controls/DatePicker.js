import React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { Button } from 'reactstrap';
import 'bootstrap-daterangepicker/daterangepicker.css';
export default class DatePicker extends React.Component {
  constructor(props) {
    super(props)

    // localized for ukrainian
    // for publishing we need to do it in other way
    this.state = {
      "locale": {
        "format": "DD.MM.YYYY",
        "separator": " - ",
        "applyLabel": "Apply",
        "cancelLabel": "Cancel",
        "fromLabel": "From",
        "toLabel": "To",
        "customRangeLabel": "Custom",
        "weekLabel": "W",
        "daysOfWeek": [
          "Mon",
          "Tu",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun"
        ],
        "monthNames": [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ],
        "firstDay": 0
      },
      dateSet: false,
      //  startDate: moment().add(-1, 'month'),
      //endDate: moment()
    }
  }

  handleChange = (event, date) => {
    var e = {
      startDate: date.startDate,
      endDate: date.endDate,
      dateSet: true
    };
    this.props.OnApply(e)
    this.setState(e);
  }

  dateName() {
    var date = this.state.startDate && "since " + this.state.startDate.format('DD.MM.YYYY') + " until " + this.state.endDate.format('DD.MM.YYYY')
    return date || "Select dates range"
  }
  onEraseClick = () => {
    var e = {
      dateSet: false,
      startDate: null,
      endDate: null
    }
    this.setState(e)
    this.props.OnClear(e)
  }
  render() {
    return (<div className={"drp " + this.props.className}>
      <DateRangePicker locale={this.state.locale} onApply={this.handleChange}>
        <button className="drp_btn btn btn-secondary">{this.dateName()}</button>
      </DateRangePicker>
      {
        this.state.dateSet
          ? <Button onClick={this.onEraseClick} className="drp_close border-0 btn btn-outline-dark">X</Button>
          : null
      }
    </div>);
  }
}
