import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from 'registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import 'index.css';
import App from 'Main/App';

ReactDOM.render(<App/>, document.getElementById('root'));

registerServiceWorker();
