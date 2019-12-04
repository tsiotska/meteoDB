import React from 'react';
import CountryList from './Containers/CountryList';
import DaysItemsList from './Containers/DaysItemsList';
import SelectedStationsList from './Containers/SelectedStationsList'
import $ from 'jquery';

export default class Containers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: []
    };
  }
  render() {

    return (<div className="bottom-container container-fluid p-3 d-flex" >
      <div className="button container-flag"  onClick={() => $('.bottom-container').toggleClass('active')}>
        
      </div>
      <div className="navi card p-2 container-fluid my-2">
        <nav>
          <div className="nav nav-tabs" id="nav-tab" role="tablist">
            <a className="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">Список країн</a>
            <a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Результати пошуку</a>
            <a className="nav-item nav-link" id="nav-res-tab" data-toggle="tab" href="#nav-res" role="tab" aria-controls="nav-res" aria-selected="false">Показники станції
            </a>
          </div>
        </nav>

        <div className="tab-content" id="nav-tabContent">
          <CountryList ctr_list={this.props.ctr_list} />
          <SelectedStationsList onStationsChange={this.props.onStationsChange} index={this.props.mapSelectedIndex} selectedStations={this.props.selectedStations} />
          <DaysItemsList selectedPage={this.state.selectedPage} daysItems={this.props.daysItems} />
        </div>
      </div>
    </div>);
  }
}
