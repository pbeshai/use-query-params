import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { QueryParamProvider } from 'use-query-params';
import history from './history';

ReactDOM.render(
  /* note history={history} here is optional, but probably best for consistency */
  <QueryParamProvider history={history}>
    <App />
  </QueryParamProvider>,
  document.getElementById('root')
);
