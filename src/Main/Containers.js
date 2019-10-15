import React from 'react';
import CountryList from '../Main/Containers/CountryList';
import DaysItemsList from '../Main/Containers/DaysItemsList';
import SelectedStationsList from '../Main/Containers/SelectedStationsList'
import DownloadList from '../Main/Containers/DownloadList';
import ChartX from '../Main/Controls/Chart'

export default class Containers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: []
    };
  }

  render() {

    return (<div className="container-fluid p-3 mt-5 d-flex">
      <div className="navi card p-2 container-fluid my-2">
        <nav>
          <div className="nav nav-tabs" id="nav-tab" role="tablist">
            <a className="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab"
               aria-controls="nav-home" aria-selected="true">Список країн</a>
            <a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab"
               aria-controls="nav-profile" aria-selected="false">Результати пошуку</a>
            <a className="nav-item nav-link" id="nav-res-tab" data-toggle="tab" href="#nav-res" role="tab"
               aria-controls="nav-res" aria-selected="false">Показники станції
            </a>
            <a className="nav-item nav-link" id="nav-dwn_list-tab" data-toggle="tab" href="#nav-dwn_list" role="tab"
               aria-controls="nav-dwn_list" aria-selected="false">Файли
            </a>
            <a className="nav-item nav-link" id="nav-chart-tab" data-toggle="tab" href="#nav-chart" role="tab"
               aria-controls="nav-chart" aria-selected="false">Графік
            </a>
          </div>
        </nav>
        <div className="tab-content" id="nav-tabContent">
          <CountryList ctr_list={this.props.ctr_list}/>
          <SelectedStationsList index={this.props.mapSelectedIndex} selectedStations={this.props.selectedStations}/>
          <DaysItemsList selectedPage={this.state.selectedPage} daysItems={this.props.daysItems}/>
          <DownloadList list={this.props.DownloadList}/>
          <ChartX data={{
            datasets: this.props.daysItems.map((e) => {
              let el = e.props.data;
              return {label: el.date, data: el.prcp.val}
            })
          }}/>
        </div>
      </div>
    </div>);
  }
}
