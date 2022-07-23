import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import UseQueryParamExample from './UseQueryParamExample';
import UseQueryParamsExample from './UseQueryParamsExample';
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
        adapter={ReactRouter6Adapter}
        options={{
          searchStringToObject: parse,
          objectToSearchString: stringify,
        }}
      >
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/useQueryParams" replace />} />
            <Route path="useQueryParam" element={<UseQueryParamExample />} />
            <Route path="useQueryParams" element={<UseQueryParamsExample />} />
          </Route>
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  </React.StrictMode>
);
