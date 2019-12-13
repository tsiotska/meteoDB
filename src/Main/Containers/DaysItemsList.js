import React, { Component } from 'react';
import Pagination from '../../Main/Controls/Pagination';
import { emptyContainer } from '../../js/const'
import {connect} from "react-redux";

class DaysItemsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: null
    }
  }

  onChangePage = (selectedPage) => {
    this.setState({ selectedPage });
  };

  render() {
    let array = this.props.weather.length > 0 ? this.props.weather : false;
    let displayEmptyPage = (array);
    return (<div
      className="container" >

      {
        displayEmptyPage
          ? <Pagination items={array} onChangePage={this.onChangePage} />
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

const
  mapStateToProps = state => ({
    weather: state.dataReducer.weather,
  });

export default connect(mapStateToProps)(DaysItemsList);
