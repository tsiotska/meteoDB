import React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {Button} from 'reactstrap';
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
          "Пн",
          "Вт",
          "Ср",
          "Чт",
          "Пт",
          "Сб",
          "Нд"
        ],
        "monthNames": [
          "Січень",
          "Лютий",
          "Березень",
          "Квітень",
          "Травень",
          "Червень",
          "Липень",
          "Серпень",
          "Вересень",
          "Жовтень",
          "Листопад",
          "Грудень"
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

  DateName() {
    var date = this.state.startDate && this.state.startDate.format('DD.MM.YYYY') + " до " + this.state.endDate.format('DD.MM.YYYY')
    return date || "Вибрати дату"
  }
  OnEraseClick = () => {
    var e = {
      dateSet: false,
      startDate: null,
      endDate: null
    }
    this.setState(e)
    this.props.OnClear(e)
  }
  render() {
    return (<div className="drp mx-auto d-flex justify-content-center w-100 m-2">
      <DateRangePicker locale={this.state.locale} onApply={this.handleChange}>
        <button className="drp_btn btn btn-secondary">{this.DateName()}</button>
      </DateRangePicker>
      {
        this.state.dateSet
          ? <Button onClick={this.OnEraseClick}>X</Button>
          : null
      }
    </div>);
  }
}
