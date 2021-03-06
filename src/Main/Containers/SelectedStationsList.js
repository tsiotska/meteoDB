import React from 'react';
import Pagination from '../../Main/Controls/Pagination'
import { emptyContainer } from '../../js/const'
import { classJoin } from "../../js/const";
import { connect } from "react-redux";

class SelectedStationsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: null
    }
  }

  onStationsChange = (selectedPage) => {
    this.setState({ selectedPage });
  };

  render() {
    let array = this.props.stations.length > 0 ? this.props.stations : false;
    let displayEmptyPage = (array);

    return (<div className={"" + classJoin(this.props.className)}>
      <h2>Selected stations</h2>
      <div className="container" /* className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" */>
        {
          displayEmptyPage
            ? <Pagination items={array} onSelected={this.props.index}
              onChangePage={this.onStationsChange} />
            : ""
        }
        {
          displayEmptyPage
            ? (<div className="container row mx-auto justify-content-center" id="result">
              {this.state.selectedPage}
            </div>)
            : emptyContainer
        }
      </div>
    </div>);
  }
}
const
  mapStateToProps = state => ({
    stations: state.dataReducer.stations,
  });
export default connect(mapStateToProps)(SelectedStationsList);
