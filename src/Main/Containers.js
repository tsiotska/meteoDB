import React from 'react';
import Pagination from './Pagination'
export default class Containers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: []
    };
  }
  onChangePage = (selectedPage) => {
    this.setState({selectedPage: selectedPage});
  }
  render() {
    return (<div className="container-fluid p-3 mt-5 d-flex">
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
          <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
            <div className="container">
              <ul className="text-center list-group" id="ctr-list">{this.props.ctr_list}</ul>
            </div>
          </div>
          <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
            <div className="container row mx-auto justify-content-center" id="result">{this.props.stations}</div>
          </div>
          <div className="tab-pane fade" id="nav-res" role="tabpanel" aria-labelledby="nav-res-tab">
            <div className="container d-flex  flex-column justify-content-center">
              {/* <div className=" mx-auto my-2 w-25">
                <label htmlFor="cnt">Кількість записів</label>
                <select defaultValue="50" className="custom-select" id="daysCnt">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                  <option>100</option>
                  <option>500</option>
                  <option>&infin;</option>
                </select>
              </div> */
              }
              <Pagination items={this.props.daysItems} onChangePage={this.onChangePage}/>

            </div>
            <div className="container-fluid  row mx-auto" id="result_days">
              {this.state.selectedPage}
            </div>
          </div>
        </div>
      </div>
      <div id="hidden"></div>
    </div>);
  }
}
