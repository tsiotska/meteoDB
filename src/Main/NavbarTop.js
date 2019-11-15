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
  render() { 
    return (<nav className="navbar sticky-to navbar-light bg-light">
     <a className="navbar-brand" onClick={handler} href="#top">{process.env.REACT_APP_NAME}<span className="ml-2 badge badge-info">{process.env.REACT_APP_VERSION}</span>
      </a>
      <div className="float-right small">{this.props.onMouseMove}</div>
    </nav>);
  }
}
