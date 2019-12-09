import React, {Component} from 'react';
import Pagination from '../../Main/Controls/Pagination';
import {emptyContainer} from '../../js/const'

export default class DaysItemsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: null
    }
  }

  onChangePage = (selectedPage) => {
    this.setState({selectedPage});
  };

  render() {
    let array = this.props.daysItems.length > 0 ? this.props.daysItems : false;
    let displayEmptyPage = (array);
    return (<div
      className="container" /* className="tab-pane fade" id="nav-res" role="tabpanel" aria-labelledby="nav-res-tab" */>

      {
        displayEmptyPage
          ? <Pagination items={array} onChangePage={this.onChangePage}/>
          : ""
      }

      {
        displayEmptyPage ?
          (<div className="container-fluid  row mx-auto" id="result_days">
            {this.state.selectedPage}
          </div>)
          : emptyContainer
      }
    </div>)
  }
}
