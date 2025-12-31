import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "./css/css components/button.css";
import "./css/css components/alerts.css";
import "./css/css components/loading.css";
import "./css/css components/google.css";
import './Theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n/i18n.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
