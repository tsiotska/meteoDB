import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import './css/weather-icons.min.css';
import './index.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import './scss/styles.css';
import App from './Main/App';

ReactDOM.render(<App/>, document.getElementById('root'));
registerServiceWorker();
