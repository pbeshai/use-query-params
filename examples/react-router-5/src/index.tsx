import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './App';
import {
  QueryParamProvider,
  ExtendedStringifyOptions,
  transformSearchStringJsonSafe,
} from 'use-query-params';

const queryStringifyOptions: ExtendedStringifyOptions = {
  transformSearchString: transformSearchStringJsonSafe,
};

ReactDOM.render(
  <Router>
    <QueryParamProvider
      ReactRouterRoute={Route}
      stringifyOptions={queryStringifyOptions}
    >
      <App />
    </QueryParamProvider>
  </Router>,
  document.getElementById('root')
);
