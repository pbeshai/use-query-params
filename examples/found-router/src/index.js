import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { QueryParamProvider } from 'use-query-params';

import { createBrowserRouter, Route, makeRouteConfig } from 'found';

const RootPage = ({ children, router, match }) => (
  <QueryParamProvider history={router} location={match.location}>
    {children}
  </QueryParamProvider>
);

const BrowserRouter = createBrowserRouter({
  routeConfig: makeRouteConfig(
    <Route path="/" Component={RootPage}>
      <Route Component={App} />
    </Route>
  ),
});

ReactDOM.render(<BrowserRouter />, document.getElementById('root'));
