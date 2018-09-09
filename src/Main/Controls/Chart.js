import {Bar} from 'react-chartjs-2';
import React, {Component} from 'react';
export default class Chart extends Component {
  render() {
    let f = (Array.isArray(this.props.data.datasets) && this.props.data.datasets.length > 0 && {
      labels: this.props.data.datasets && this.props.data.datasets.map((i) => i.label),
      datasets: [
        {
          label: 'Precipitation bar chart',
          backgroundColor: 'rgba(10, 93, 167, 0.95)',
          borderColor: 'rgba(10, 93, 167, 0.95)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: (this.props.data.datasets && this.props.data.datasets.map((i) => parseInt(i.data, 10))) || []
        }
      ]
    }) || {};
    return <div className="tab-pane fade" id="nav-chart" role="tabpanel" aria-labelledby="nav-chart-tab">
      <Bar data={f}/>
    </div>
  }
};
