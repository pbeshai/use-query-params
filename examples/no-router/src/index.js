import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { QueryParamProvider } from 'use-query-params';
import history from './history';
console.log('history = ', history);

ReactDOM.render(
  <QueryParamProvider>
    <App />
  </QueryParamProvider>,
  document.getElementById('root')
);
