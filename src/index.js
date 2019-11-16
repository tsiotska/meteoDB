import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from 'registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import 'index.css';
import {Provider} from "react-redux";
import store from "./Main/redux/store"; 

import Main from './Main/Main'; 

ReactDOM.render(<Provider store={store}><Main/></Provider>, document.getElementById('root'));

registerServiceWorker();
