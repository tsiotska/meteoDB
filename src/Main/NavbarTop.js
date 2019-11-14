import React from 'react';
const handler = function(e) {
  e.preventDefault();
  return false;
}

export default class NavbarTop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latlng: null
    }
  }

  onMouseMove=(e)=> {
    return "lat: " + e.latlng.lat + " lng: " + e.latlng.lng;
  };
  // [TASK] Load name, version from manifest
  render() {
    return (<nav className="navbar sticky-to navbar-light bg-light">
      <a className="navbar-brand" onClick={handler} href="#top">Lametsy<span className="ml-2 badge badge-info">RC 1.1</span>
      </a>
      <div className="float-right small">{this.props.onMouseMove}</div>
    </nav>);
  }
}
