import React from 'react';
import {Button} from 'reactstrap';
import Map from './Components/Map';
import Pagination from '../Pagination';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap/dist/css/bootstrap.css';

import 'bootstrap-daterangepicker/daterangepicker.css';
import $ from 'jquery';
export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: []
    };

  }
  onChangePage = (selectedPage) => {
    this.props.PageChanged(selectedPage);
    this.setState({selectedPage: selectedPage});
  }
  OnTypeChanged = (e) => {
    let p = e.target.value
    console.log(p);
    if (p !== 'ctry_full') {
      let Typeahead = this.props.Typeahead;
      Typeahead($("#querystr"), 'destroy');
    }
  }
  render() {
    return (<div className="main_map container-fluid p-0">
      <Map ActiveMarker={this.props.ActiveMarker} markers={this.state.selectedPage} currentSelected={this.props.currentSelected}/>
      <div className="cur_count_wrapper">
        <div className={"cur_count " + (
            this.props.counter
            ? ""
            : "fade")} id="result-info">{this.props.counter}</div>
      </div>
      <div className="panel flyn active  card card-body">
        <div className="scrollable">
          <div className="form-inline ">
            <div className="col-auto  mb-4">
              <label htmlFor="type">Тип поля</label>
              <select defaultValue="ctry_full" className="custom-select" onChange={this.OnTypeChanged} id="type">
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

            {/* <div className="col-auto mb-4 float-right">
              <label htmlFor="cnt">Кількість записів</label>
              <select defaultValue="50" className="custom-select" id="cnt">
                <option>10</option>
                <option>20</option>
                <option >50</option>
                <option>100</option>
                <option>500</option>
                <option>&infin;</option>
              </select>
            </div> */
            }

            <div className="col-auto mb-4">
              <label htmlFor="querystr">Пошуковий параметр</label>
              <div className="input-group disabled">
                <input type="text" className="form-control typeahead" id="querystr" placeholder="Пошуковий параметр" data-provide="typeahead" readOnly="readOnly"/>
              </div>
            </div>
            <div className="col-auto">
              <button id="reeval" onClick={this.props.OnSearchClick} className="btn btn-primary my-1">Пошук</button>
              <button id="refresh" className="btn btn-secondary my-1">Очистити</button>
            </div>
          </div>
          <div className="form-inline mx-auto">
            <div id="yearsx" className="col-auto mb-4">
              <label htmlFor="years">Рік</label>
              <div className="input-group">
                <input type="text" className="form-control typeahead" id="years" placeholder="Рік" data-provide="typeahead" readOnly="readOnly"/>
                <div className="cssload-container fade">
                  <div className="cssload-whirlpool"></div>
                </div>
              </div>
            </div>
            <div id="stx" className="col-auto mb-4">
              <label htmlFor="id_st">ID Станції</label>
              <div className="input-group">
                <input type="text" className="form-control typeahead" id="id_st" placeholder="123456" data-provide="typeahead" readOnly="readOnly"/>
                <div className="stx_l1 cssload-container fade">
                  <div className="cssload-whirlpool"></div>
                </div>
              </div>
              <label htmlFor="wban_st">WBAN Станції</label>
              <div className="input-group">
                <input type="text" className="form-control typeahead" id="wban_st" placeholder="Станція" value="N/A" data-provide="typeahead" readOnly="readOnly"/>
                <div className="stx_l2 cssload-container fade">
                  <div className="cssload-whirlpool"></div>
                </div>
              </div>
            </div>

            <div id="datex" className="col-auto mb-4">
              <label htmlFor="date">Число</label>
              <div className="input-group">
                <input type="text" className="form-control typeahead" id="date" placeholder="Дата" data-provide="typeahead" readOnly="readOnly"/>
                <div className="cssload-container fade">
                  <div className="cssload-whirlpool"></div>
                </div>
              </div>
              <div className="drp mx-a">
                <DateRangePicker startDate="1/1/1939" endDate="3/1/2018">
                  <button className="drp_btn btn btn-secondary">Вибрати дату</button>
                </DateRangePicker>
              </div>
            </div>
          </div>
          <nav aria-label="Page nav" className="mx-auto">
            <ul id="stNav" className="pagination justify-content-center"></ul>
          </nav>

          <div id="flyn_current_station" className="w-100 d-flex flex-column">{this.props.currentStation}</div>
          <Button id="flyn_toggle" className="fx btn asside btn-md" role="button">
            <span className="fx1"></span>
            <span className="fx2"></span>
          </Button>
        </div>
      </div>

      <div className="m-2">
        <Pagination items={this.props.markers} onChangePage={this.onChangePage}/></div>

    </div>);
  }
}
