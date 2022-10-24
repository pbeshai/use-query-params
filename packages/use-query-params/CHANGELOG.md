# Changelog

## use-query-params v2.1.2 (October 24, 2022)
- fix: #244 `updateLocation` returns an empty string for `href` when the original `location.href` is not defined. This allows `updateLocation` to be recursively recalled without crashing when creating a `new URL()`  (thank you @jmcpeak) 

## use-query-params v2.1.1 (September 16, 2022)
- fix: #241 import from react-router-dom in adapters to prevent error about wrong context. (thank you @lisandro52)

## use-query-params v2.1.0 (August 31, 2022)
- feat: #234 skip unnecessary updates by default. new option `skipUpdateWhenNoChange` defaults to true (set to false for previous behavior)

## use-query-params v2.0.1 (August 31, 2022)
- fixes #233 - consecutive calls to setters (e.g. setFoo('a'); setBar('b')) properly accumulate. Previously only the last would make it through.


## use-query-params v2.0.0

**Breaking**

- Drop dependency for query-string. New default uses URLSearchParams which doesn’t support `null`. You can continue using [query-string](https://github.com/sindresorhus/query-string) by specifying the `searchStringToObject` and `objectToSearchString` options as parse and stringify respectively.
- Modify **QueryParamProvider** to take adapter prop, no longer taking react router or reach props

**New Features**

- Deep imports for React-Router 5 and 6 adapters
- Supports registering params in the **QueryParamProvider** to have them available to any downstream hooks.
    - Supports nesting **QueryParamProviders** to extend the registered params list
- Additional function signatures have been added, but greater care must be taken to get proper types out of the response.
    - `useQueryParam(’myparam’)` ← param type is inherited from the params registered in the **QueryParamProvider**
    - `useQueryParam(’myparam’, StringParam, options)`
    - `useQueryParams()` ← gets all params from the **QueryParamProvider**
    - `useQueryParams([’myparam1’, ‘myparam2’])` ← gets just myparam1 and myparam2 from those registered in the **QueryParamProvider**.
    - `useQueryParams({ myparam: StringParam }, options)`
    - `useQueryParams({ myparam: ‘inherit’ }, options)` ←inherit myparam param name from **QueryParamProvider**

- New `options` prop to **QueryParamProvider** and argument to **useQueryParam(s)**
    - (experimental) batching via `enableBatching` option (i.e., multiple consecutive calls to setQueryParams in a row only result in a single update to the URL). This seems to work but would require updating the way all the tests are written to verify for sure, so marking as experimental for now.
    - `removeDefaultsFromUrl` (default: false). This happens on updates only, not on initial load. Requires the use of the `default` attribute on a parameter to function (note serialize-query-params v2 withDefault now populates this). 
    - `includeKnownParams` -  in addition to those specified, also include all preconfigured parameters from the **QueryParamProvider**
    - `includeAllParams` (default: false) - in addition to those specified, include all other parameters found in the current URL
    - `updateType` (default “pushIn”) - the default update type when set is called.
    - `searchStringToObject, objectToSearchString` (default uses URLSearchParams) - equivalent of `parse` and `stringify` from query-string.
- Parameters now can include `urlName` to automatically convert to a different name in the URL (e.g. { encode, decode, urlName })
- Caches decoded values across multiple hook calls from different components

**Fixes**

- Stops reading from refs in render to prepare for future versions of React where this is not allowed.
- Simplifies the way locations are updated by only passing in the search string as the new location.

- **v2.0.0-rc.1** Fix CJS imports of adapters (#224)
- **v2.0.0-rc.1** Be more defensive about reading updateType


### Migrating from v1

There are two things you need to adjust to update from v1:

1. Decide if you want to keep query-string as your parser/stringifier or if you want to simplify to using the built-in URLSearchParams solution in v2. The simplest path for migration is to keep your query-string dependency and specify that use-query-params should use it for `searchStringToObject` and `objectToSearchString`. 
2. Switch to using an adapter to link your routing library with use-query-params.

Here's an example of the changes to complete both for React Router 5:

```diff
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryParamProvider } from 'use-query-params';
+ import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
+ import { parse, stringify } from 'query-string';
- import { BrowserRouter as Router, Route } from 'react-router-dom';
+ import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';

ReactDOM.render(
  <Router>
-    <QueryParamProvider ReactRouterRoute={Route}>
+    <QueryParamProvider
+      adapter={ReactRouter5Adapter}
+      options={{
+        searchStringToObject: parse,
+        objectToSearchString: stringify,
+      }}
+    >
      <App />
    </QueryParamProvider>
  </Router>,
  document.getElementById('root')
);
```

If you're using react-router-6, you'd import that adapter instead:

```js
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
```

Note the `options` above are optional, but will retain the behavior you're used to from v1, which used query-string internally. If you want to switch to using URLSearchParams and not use query-string, you would do:

```diff
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryParamProvider } from 'use-query-params';
+ import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
- import { BrowserRouter as Router, Route } from 'react-router-dom';
+ import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';

ReactDOM.render(
  <Router>
-    <QueryParamProvider ReactRouterRoute={Route}>
+    <QueryParamProvider adapter={ReactRouter5Adapter}>
      <App />
    </QueryParamProvider>
  </Router>,
  document.getElementById('root')
);
```

