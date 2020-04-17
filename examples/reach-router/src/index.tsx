import React from 'react';
import ReactDOM from 'react-dom';
import { globalHistory, Router } from '@reach/router';
import App from './App';
import { QueryParamProvider } from 'use-query-params';

ReactDOM.render(
  <Router>
    <QueryParamProvider {...{ path: '/' }} reachHistory={globalHistory}>
      <App default />
    </QueryParamProvider>
  </Router>,
  document.getElementById('root')
);
