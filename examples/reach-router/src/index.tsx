import React from 'react';
import ReactDOM from 'react-dom';
import { globalHistory, Router } from '@reach/router';
import App from './App';
import { QueryParamProvider } from 'use-query-params';

ReactDOM.render(
  <QueryParamProvider reachHistory={globalHistory}>
    <Router>
      <App default />
    </Router>
  </QueryParamProvider>,
  document.getElementById('root')
);
