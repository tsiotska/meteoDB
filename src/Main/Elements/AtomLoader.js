import React, {Component} from 'react';

export default class LoaderReactor extends Component {
  render() {
    return (<div className={"x_loader " + (
        this.props.isVisible
        ? 'top'
        : 'fade')}>
      <div className="st_loader_reactor m-auto">
        <div className="st_loader-inner_reactor">
          <div className="dx st_loader x1">
            <div className="el">
              <span className="el-inner"/>
            </div>
            <div className="el">
              <span className="el-inner"/>
            </div>
          </div>
          <div className="dx st_loader x2">
            <div className="el">
              <span className="el-inner"/>
            </div>
            <div className="el">
              <span className="el-inner"/>
            </div>
            <div className="el">
              <span className="el-inner"/>
            </div>
          </div>
          <div className="dx st_loader x3">
            <div className="el">
              <span className="el-inner"/>
            </div>
          </div>
          <div className="dx st_loader x4">
            <div className="el">
              <span className="el-inner"/>
            </div>
            <div className="el">
              <span className="el-inner"/>
            </div>
            <div className="el">
              <span className="el-inner"/>
            </div>
          </div>
          <div className="st_loader_core"/>
        </div>
        <div className="text-center wload">
          <p className="load_text">Завантаження...</p>
          {/* localization??? */}
        </div>
        <div className="progress-x">
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={{
  width: this.props.progress * 100 + "%"
}} aria-valuemin="0" aria-valuemax="100"/>
          </div>
        </div>
      </div>
    </div>);
  }
};
