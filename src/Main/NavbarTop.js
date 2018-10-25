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

  onMouseMove(e) {
    return "lat: " + e.latlng.lat + " lng: " + e.latlng.lng;
  }
  render() {
    return (<nav className="navbar sticky-to navbar-light bg-light">
      <a className="navbar-brand" onClick={handler} href="#top">X-Meteo Prototype<span className="ml-2 badge badge-info">Alfa 0.26</span>
      </a>
      <div className="float-right small">{this.props.onMouseMove}</div>
    </nav>);
  }
}
