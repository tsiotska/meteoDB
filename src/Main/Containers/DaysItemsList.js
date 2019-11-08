import React, {Component} from 'react';
import Pagination from '../../Main/Controls/Pagination'
import {empt} from '../../js/const'
export default class DaysItemsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: []
    }
  }
  onChangePage = (selectedPage) => {
    this.setState({ selectedPage });
  };

  render() {
    return (<div className="tab-pane fade" id="nav-res" role="tabpanel" aria-labelledby="nav-res-tab">
      <div className="container d-flex  flex-column justify-content-center">
        {
          this.props.daysItems && this.props.daysItems.length > 0
            ? <Pagination items={this.props.daysItems} onChangePage={this.onChangePage}/>
            : empt
        }

      </div>
      <div className="container-fluid  row mx-auto" id="result_days">
        {this.state.selectedPage}
      </div>
    </div>)
  }
}
