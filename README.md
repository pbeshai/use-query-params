<div align="center">
  <h1>useQueryParams</h1>
  <p>A <a href="https://reactjs.org/docs/hooks-intro.html">React Hook</a> for managing state in URL query parameters with easy serialization.
  </p>
  <p>Works with <a href="https://reacttraining.com/react-router/">React Router</a> and <a href="https://reach.tech/router">Reach Router</a> out of the box.</p>
</div>
<hr />

When creating apps with easily shareable URLs, you often want to encode state as query parameters, but all query parameters must be encoded as strings. `useQueryParams` allows you to easily encode and decode data of any type as query parameters with smart memoization to prevent creating unnecessary duplicate objects.

### Installation

Using npm:

```
$ npm install --save use-query-params
```

Link your routing system (e.g., [React Router example](#), [Reach Router example](#)):
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

TODO

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


