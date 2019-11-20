import React, {Component} from 'react';
import {emptyContainer} from '../../js/const'

export default class CountryList extends Component {
  render() {
    return (<div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
      {
        this.props.ctr_list && this.props.ctr_list.length > 0
          ? <div className="container">
            <ul className="text-center list-group" id="ctr-list">{this.props.ctr_list}</ul>
          </div>
          : emptyContainer
      }
    </div>)
  }
}
