import React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { Input } from "reactstrap";

export default (props) => {
  const { areLimitAndOffsetDisabled,
    onTypeChanged, onLimitChange, onOffsetChange, onNearestChange,
    onNeighChange, polyRequest, selectorByField, isLoading, source, unControlledInput} = props;
  return (
    <div className="input-group">
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


