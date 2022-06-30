import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { parse, stringify } from 'query-string';

ReactDOM.render(
  <Router>
    <QueryParamProvider
      Adapter={ReactRouter5Adapter}
      options={{
        enableBatching: true,
        parseParams: parse,
        stringifyParams: stringify,
      }}
    >
      <App />
    </QueryParamProvider>
  </Router>,
  document.getElementById('root')
);
