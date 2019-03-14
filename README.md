<div align="center">
  <h1>useQueryParams</h1>
  <p>A <a href="https://reactjs.org/docs/hooks-intro.html">React Hook</a> for managing state in URL query parameters with easy serialization.
  </p>
  <p>Works with <a href="https://reacttraining.com/react-router/">React Router</a> and <a href="https://reach.tech/router">Reach Router</a> out of the box. TypeScript supported.</p>

<hr />

<a href="#installation">Installation</a> | 
<a href="#usage">Usage</a> | 
<a href="#examples">Examples</a> | 
<a href="#api">API</a>

</div>
<hr/>

When creating apps with easily shareable URLs, you often want to encode state as query parameters, but all query parameters must be encoded as strings. `useQueryParams` allows you to easily encode and decode data of any type as query parameters with smart memoization to prevent creating unnecessary duplicate objects.

### Installation

Using npm:

```
$ npm install --save use-query-params
```

Link your routing system (e.g., [React Router example](https://github.com/pbeshai/use-query-params/blob/master/examples/react-router/src/index.tsx), [Reach Router example](https://github.com/pbeshai/use-query-params/blob/master/examples/reach-router/src/index.tsx)):
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import App from './App';

ReactDOM.render(
  <Router>
    <QueryParamProvider ReactRouterRoute={Route}>
      <App />
    </QueryParamProvider>
  </Router>,
  document.getElementById('root')
);
```


### Usage

Add the hook to your component. There are two options: `useQueryParam`:
```js
import * as React from 'react';
import { useQueryParam, NumberParam } from 'use-query-params';

const UseQueryParamExample = () => {
  // something like: ?x=123 in the URL
  const [num, setNum] = useQueryParam('x', NumberParam);

  return (
    <div>
      <h1>num is {num}</h1>
      <button onClick={() => setNum(Math.random())}>Change</button>
    </div>
  );
};

export default UseQueryParamExample;
```

Or `useQueryParams`:
```js
import * as React from 'react';
import {
  useQueryParams,
  StringParam,
  NumberParam,
  ArrayParam,
} from 'use-query-params';

const UseQueryParamsExample = () => {
  // something like: ?x=123&q=foo&filters=a_b_c in the URL
  const [query, setQuery] = useQueryParams({
    x: NumberParam,
    q: StringParam,
    filters: ArrayParam,
  });
  const { x: num, q: searchQuery, filters = [] } = query;

  return (
    <div>
      <h1>num is {num}</h1>
      <button onClick={() => setQuery({ x: Math.random() })}>Change</button>
      <h1>searchQuery is {searchQuery}</h1>
      <h1>There are {filters.length} filters active.</h1>
      <button
        onClick={() =>
          setQuery(
            { x: Math.random(), filters: [...filters, 'foo'], q: 'bar' },
            'push'
          )
        }
      >
        Change All
      </button>
    </div>
  );
};

export default UseQueryParamsExample;
```

### Examples

A few basic [examples](https://github.com/pbeshai/use-query-params/tree/master/examples) have been put together to demonstrate how `useQueryParams` works with different routing systems.

- [React Router Example](https://github.com/pbeshai/use-query-params/tree/master/examples/react-router)
- [Reach Router Example](https://github.com/pbeshai/use-query-params/tree/master/examples/reach-router)

### API

- [UrlUpdateType](#urlupdatetype)
- [Param Types](#param-types)
- [useQueryParam](#usequeryparam)
- [useQueryParams](#usequeryparams-1)
- [encodeQueryParams](#encodequeryparams)
- [QueryParamProvider](#queryparamprovider)
- [Type Definitions](https://github.com/pbeshai/use-query-params/blob/master/src/types.ts)
- [Serialization Utility Functions](https://github.com/pbeshai/use-query-params/blob/master/src/serialize.ts)

#### UrlUpdateType

The `UrlUpdateType` is a string type definings the different methods for updating the URL:

 - `'replaceIn'`: Replace just a single parameter, leaving the rest as is
 - `'replace'`: Replace all parameters with just those specified
 - `'pushIn'`: Push just a single parameter, leaving the rest as is (back button works)
 - `'push'`: Push all parameters with just those specified (back button works)


#### Param Types
See [all param definitions here](https://github.com/pbeshai/use-query-params/blob/master/src/params.ts). You can define your own parameter types by creating an object with an `encode` and a `decode` function. See the existing definitions for examples.

Note that all nully values will encode and decode as `undefined`.

| Param | Type | Example Decoded | Example Encoded |
| --- | --- | --- | --- |
| StringParam | string | `'foo'` | `'foo'` |
| NumberParam | number | `123` | `'123'` |
| ObjectParam | { key: string } | `{ foo: 'bar', baz: 'zzz' }` | `'foo-bar_baz-zzz'` |
| ArrayParam | string[] | `['a','b','c']` | `'a_b_c'` |
| JsonParam | any | `{ foo: 'bar' }` | `'{"foo":"bar"}'` |
| DateParam | Date | `Date(2019, 2, 1)` | `'2019-03-01'` |
| BooleanParam | boolean | `true` | `'1'` |
| NumericObjectParam | { key: number } | `{ foo: 1, bar: 2 }` | `'foo-1_bar-2'` |
| NumericArrayParam | number[] | `[1, 2, 3]` | `'1_2_3'` |

**Example**
```js
import { ArrayParam, useQueryParam, useQueryParams } from 'use-query-params';

// typically used with the hooks:
const [foo, setFoo] = useQueryParam('foo', ArrayParam);
// - OR -
const [query, setQuery] = useQueryParams({ foo: ArrayParam });
```
<br/>


#### useQueryParam

```js
useQueryParam<T>(name: string, paramConfig: QueryParamConfig<T>, rawQuery?: ParsedQuery):
  [T | undefined, (newValue: T, updateType?: UrlUpdateType) => void]
```

Given a query param name and query parameter configuration `{ encode, decode }`
return the decoded value and a setter for updating it.

The setter takes two arguments `(newValue, updateType)` where updateType
is one of `'replace' | 'replaceIn' | 'push' | 'pushIn'`, defaulting to
`'replaceIn'`.

You may optionally pass in a rawQuery object, otherwise the query is derived
from the location available in the QueryParamContext.

**Example**
```js
import { useQueryParam, NumberParam } from 'use-query-params';

// reads query parameter `foo` from the URL and stores its decoded numeric value
const [foo, setFoo] = useQueryParam('foo', NumberParam);
setFoo(500);
setFoo(123, 'push');
```

<br/>

#### useQueryParams

```js
useQueryParams<QPCMap extends QueryParamConfigMap>(paramConfigMap: QPCMap):
  [DecodedValueMap<QPCMap>, SetQuery<QPCMap>]
```

Given a query parameter configuration (mapping query param name to `{ encode, decode }`),
return an object with the decoded values and a setter for updating them.

The setter takes two arguments `(newQuery, updateType)` where updateType
is one of `'replace' | 'replaceIn' | 'push' | 'pushIn'`, defaulting to
`'replaceIn'`.

**Example**
```js
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

// reads query parameters `foo` and `bar` from the URL and stores their decoded values
const [query, setQuery] = useQueryParams({ foo: NumberParam, bar: StringParam });
setQuery({ foo: 500 })
setQuery({ foo: 123, bar: 'zzz' }, 'push');
```

<br/>

**Example with Custom Parameter Type**
Parameter types are just objects with `{ encode, decode }` functions. You can
provide your own if the provided ones don't work for your use case.

```js
import { useQueryParams } from 'use-query-params';

const MyParam = {
  encode(value) {
    return `${value * 10000}`;
  }

  decode(strValue) {
    return parseFloat(strValue) / 10000;
  }
}

// ?foo=10000 -> query = { foo: 1 }
const [query, setQuery] = useQueryParams({ foo: MyParam });

// goes to ?foo=99000
setQuery({ foo: 99 })
```
<br/>

#### encodeQueryParams

```js
encodeQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  query: Partial<DecodedValueMap<QPCMap>>
): EncodedQueryWithNulls
```

Convert the values in query to strings via the encode functions configured
in paramConfigMap. This can be useful for constructing links using decoded
query parameters.

**Example**
```js
import { stringify } from 'query-string';
import { encodeQueryParams, NumberParam } from 'use-query-params';

// encode each parameter according to the configuration
const encodedQuery = encodeQueryParams({ foo: NumberParam }, { foo });
const link = `/?${stringify(encodedQuery)}`;
```

<br/>

#### QueryParamProvider
```js
// Use one of these:
<QueryParamProvider ReactRouterRoute={Route}><App /></QueryParamProvider>

<QueryParamProvider reachHistory={globalHisory}><App /></QueryParamProvider>

<QueryParamProvider history={myCustomHistory}><App /></QueryParamProvider>
```

The **QueryParamProvider** component links your routing library's history to
the **useQueryParams** hook. It is needed for the hook to be able to update
the URL and have the rest of your app know about it.

See the tests or these examples for how to use it:

- [React Router Example](https://github.com/pbeshai/use-query-params/tree/master/examples/react-router)
- [Reach Router Example](https://github.com/pbeshai/use-query-params/tree/master/examples/reach-router)


**Example (Reach Router)**
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { globalHistory, Router } from '@reach/router';
import { QueryParamProvider } from 'use-query-params';
import App from './App';

ReactDOM.render(
  <QueryParamProvider reachHistory={globalHistory}>
    <Router>
      <App default />
    </Router>
  </QueryParamProvider>,
  document.getElementById('root')
);
```
<br/>

### Development

Run the typescript compiler in watch mode:

```
npm run dev
```


You can run an example app:

```
npm link
cd examples/react-router
npm install
npm link use-query-params
npm start
```


