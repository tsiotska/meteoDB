import React from "react";
import {Typeahead} from "react-bootstrap-typeahead";
import DatePicker from '../Controls/DatePicker';
import {Input} from "reactstrap";

export default class WeatherAggregationComponent extends React.Component {
    render() {
        
  const {areLimitAndOffsetDisabled, ApplyCalendarDate, onDaysChange, onYearsChange,
    onTypeChanged, onLimitChange, onMonthsChange, onOffsetChange, onNearestChange,
    onNeighChange, polyRequest, selectorByField, typeahead, isLoading, source, unControlledInput} = this.props;
        return (<div>
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
                                <DatePicker OnClear={ApplyCalendarDate} OnApply={ApplyCalendarDate} className="mx-auto d-flex justify-content-center" />
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
                                    data-toggle="tooltip" data-html="true" data-placement="left" title="<div className='tooltip-info'> Examples: <br>2018-2019<br>2010,2014-2016,2019</div>"
                                    placeholder="Years" data-provide="typeahead" />
                            </div>

                            <div id="monthx" className="mx-auto input-group m-1">
                                <Input type="text" id="months"
                                    onChange={onMonthsChange}
                                    className="form-control typeahead"
                                    data-toggle="tooltip" data-html="true" data-placement="left" title="<div className='tooltip-info'> Examples: <br>1-10<br>1,3-6,10-12</div>"
                                    placeholder="Months" data-provide="typeahead" />
                            </div>

                            <div id="daysx" className="mx-auto input-group m-1">
                                <Input type="text" id="days"
                                    onChange={onDaysChange}
                                    className="form-control typeahead"
                                    data-toggle="tooltip" data-html="true" data-placement="left" title="<div className='tooltip-info'> Examples: <br>1-31<br>1,23-26,30</div>"
                                    placeholder="Days" data-provide="typeahead" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }
}