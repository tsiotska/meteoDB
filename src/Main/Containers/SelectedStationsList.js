import React, {Component} from 'react';
import Pagination from '../../Main/Controls/Pagination'
import {emptyContainer} from '../../js/const'

export default class SelectedStationsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: null
    }
  }

  onStationsChange = (selectedPage) => {
    this.setState({selectedPage});
  };

  render() {
    let array = this.props.selectedStations.length > 0 ? this.props.selectedStations : false;
    let displayEmptyPage = (array);

    return (<div className="container" /* className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" */>
      {
        displayEmptyPage
          ? <Pagination items={array} onSelected={this.props.index}
                        onChangePage={this.onStationsChange}/>
          : ""
      }
      {
        displayEmptyPage
          ? (<div className="container row mx-auto justify-content-center" id="result">
            {this.state.selectedPage}
          </div>)
          : emptyContainer
      }
    </div>)
  }
}
