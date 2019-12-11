import React from "react";
import {Typeahead} from "react-bootstrap-typeahead";
import DatePicker from '../../Controls/DatePicker';
import {Input} from "reactstrap";

export default (props) => {
  const {areLimitAndOffsetDisabled, ApplyCalendarDate, onDaysChange, onYearsChange,
    onTypeChanged, onLimitChange, onMonthsChange, onOffsetChange, onNearestChange,
    onNeighChange, polyRequest, selectorByField, typeahead, isLoading, source, unControlledInput} = props;
  return (
    <div >
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

      <div className="form-inline row top-group">

        <div className="input-group col">
          <div className="input-group-prepend">
            <label className="input-group-text" htmlFor="exampleCheck1">Field type</label>
          </div>
          {
            // TODO: fetch values from API
            // api/gsod/stations/types
          }
          <select defaultValue="ctry_full" className="form-control custom-select" ref={selectorByField} disabled={polyRequest}
                  onChange={onTypeChanged} id="type">
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
          <Typeahead id="typeahead" disabled={!!polyRequest}
                     multiple={true}
                     isLoading={isLoading}
                     placeholder="Query parameter"
                     onChange={unControlledInput}
                     ref={(typeahead) => typeahead = typeahead}
                     options={source} />
        </div>
      </div>

      <div className={polyRequest ? "disabledQueryInput" : "input-group   form-check"}>
        <div className="input-group-prepend">
          <label className="input-group-text" htmlFor="nbs_chk">With neighbors</label>
        </div>
        <div className="input-group-append">
          <div className="input-group-text">
            <Input type="checkbox" id="nbs_chk" className="" onChange={onNeighChange} />
          </div>
        </div>
      </div>

      <div className={polyRequest ? "disabledQueryInput" : "input-group"}>

        <div className="input-group-prepend">
          <label className="input-group-text" htmlFor="exampleCheck1">Nearest N stations</label>
        </div>
        <Input type="text" className="form-control" id="nearest_chk" onChange={onNearestChange} />
      </div>

      <div className="form-inline">
        <div className="row">
          <div className="input-group col-6">
            <div className="input-group-prepend">
              <span className="input-group-text">Count</span>
            </div>
            <Input type="text" id="count" className="form-control typeahead" placeholder="Count"
                   data-provide="typeahead" onChange={onLimitChange} disabled={areLimitAndOffsetDisabled} />
          </div>
          <div className="input-group col-6">
            <div className="input-group-prepend">
              <span className="input-group-text">Offset</span>
            </div>
            <Input type="text" id="offset" className="form-control typeahead" placeholder="Offset"
                   data-provide="typeahead" onChange={onOffsetChange} disabled={areLimitAndOffsetDisabled} />
          </div>
        </div>
      </div>

    </div>);
};


