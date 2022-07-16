import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouterAdapter } from 'use-query-params/adapters/react-router';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// optionally use the query-string parse / stringify functions to
// handle more advanced cases than URLSearchParams supports.
import { parse, stringify } from 'query-string';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryParamProvider
        adapter={ReactRouterAdapter}
        options={{
          searchStringToObject: parse,
          objectToSearchString: stringify,
        }}
      >
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  </React.StrictMode>
);
