import React, {Component} from 'react';
import Pagination from 'Main/Controls/Pagination'
import {empt} from 'js/const'
export default class SelectedStationsList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPage: []
    }
  }
  onStationsChange = (selectedPage) => {
    this.setState({ selectedPage });
  }
  render() {
    return (<div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
      {
        this.props.selectedStations
          ? <Pagination items={this.props.selectedStations} onSelected={this.props.index} onChangePage={this.onStationsChange}/>
          : ""
      }
      {
        this.state.selectedPage
          ? (<div className="container row mx-auto justify-content-center" id="result">
            {this.state.selectedPage}
          </div>)
          : empt
      }
    </div>)
  }
}
