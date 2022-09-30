<div align="center">
  <h1>useQueryParams</h1>
  <p>A <a href="https://reactjs.org/docs/hooks-intro.html">React Hook</a>, HOC, and Render Props solution for managing state in URL query parameters with easy serialization.
  </p>
  <p>Works with <a href="https://reacttraining.com/react-router/">React Router</a> out of the box. TypeScript supported.</p>


  <p>
    <a href="https://www.npmjs.com/package/use-query-params"><img alt="npm" src="https://img.shields.io/npm/v/use-query-params.svg"></a>
  <a href="https://travis-ci.com/pbeshai/use-query-params/"><img alt="Travis (.com)" src="https://img.shields.io/travis/com/pbeshai/use-query-params.svg"></a>

  </p>
<hr />

<a href="#installation">Installation</a> |
<a href="#usage">Usage</a> |
<a href="#examples">Examples</a> |
<a href="#api">API</a> |
<a href="https://pbeshai.github.io/use-query-params/">Demo</a>

</div>
<hr/>

When creating apps with easily shareable URLs, you often want to encode state as query parameters, but all query parameters must be encoded as strings. `useQueryParams` allows you to easily encode and decode data of any type as query parameters with smart memoization to prevent creating unnecessary duplicate objects. It uses [serialize-query-params](../serialize-query-params/).


**Migrating from v1?** See [details in the changelog](./CHANGELOG.md#migrating-from-v1).

### Installation

Using npm:

```
$ npm install --save use-query-params
```

Link your routing system via an adapter (e.g., [React Router 6 example](../../examples/react-router-6/src/index.tsx), [React Router 5 example](../../examples/react-router-5/src/index.tsx)):

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <Routes>
        <Route path="/" element={<App />}>
      </Routes>
    </QueryParamProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
```

By default, use-query-params uses [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) to handle interpreting the location string, which means it does not decode `null` and has limited handling of other more advanced URL parameter configurations. If you want access to those features, add a third-party library like [query-string](https://github.com/sindresorhus/query-string) and tell use-query-params to use it:

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// optionally use the query-string parse / stringify functions to
// handle more advanced cases than URLSearchParams supports.
import { parse, stringify } from 'query-string';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
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
      </Routes>
    </QueryParamProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
      
```


### Usage

Be sure to add **QueryParamProvider** as shown in Installation above. 

Add the hook to your component. There are two options: `useQueryParam`:

```js
import * as React from 'react';
import { useQueryParam, NumberParam, StringParam } from 'use-query-params';

const UseQueryParamExample = () => {
  // something like: ?x=123&foo=bar in the URL
  const [num, setNum] = useQueryParam('x', NumberParam);
  const [foo, setFoo] = useQueryParam('foo', StringParam);

  return (
    <div>
      <h1>num is {num}</h1>
      <button onClick={() => setNum(Math.random())}>Change</button>
      <h1>foo is {foo}</h1>
      <button onClick={() => setFoo(`str${Math.random()}`)}>Change</button>
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
  withDefault,
} from 'use-query-params';

// create a custom parameter with a default value
const MyFiltersParam = withDefault(ArrayParam, [])

const UseQueryParamsExample = () => {
  // something like: ?x=123&q=foo&filters=a&filters=b&filters=c in the URL
  const [query, setQuery] = useQueryParams({
    x: NumberParam,
    q: StringParam,
    filters: MyFiltersParam,
  });
  const { x: num, q: searchQuery, filters } = query;

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

<details>
<summary>Or with the higher-order component (HOC) <b>withQueryParams</b>:</summary>

```js
import * as React from 'react';
import {
  withQueryParams,
  StringParam,
  NumberParam,
  ArrayParam,
  withDefault,
} from 'use-query-params';

const WithQueryParamsExample = ({ query, setQuery }: any) => {
  const { x: num, q: searchQuery, filters } = query;

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

// create a custom parameter with a default value
const MyFiltersParam = withDefault(ArrayParam, [])

export default withQueryParams({
  x: NumberParam,
  q: StringParam,
  filters: MyFiltersParam,
}, WithQueryParamsExample);
```
</details>

<details>
<summary>Or with render props via <b>&lt;QueryParams&gt;</b>:</summary>

```js
import * as React from 'react';
import {
  QueryParams,
  StringParam,
  NumberParam,
  ArrayParam,
  withDefault,
} from 'use-query-params';

// create a custom parameter with a default value
const MyFiltersParam = withDefault(ArrayParam, [])

const RenderPropsExample = () => {
  const queryConfig = {
    x: NumberParam,
    q: StringParam,
    filters: MyFiltersParam,
  };
  return (
    <div>
      <QueryParams config={queryConfig}>
        {({ query, setQuery }) => {
          const { x: num, q: searchQuery, filters } = query;
          return (
            <>
              <h1>num is {num}</h1>
              <button onClick={() => setQuery({ x: Math.random() })}>
                Change
              </button>
              <h1>searchQuery is {searchQuery}</h1>
              <h1>There are {filters.length} filters active.</h1>
              <button
                onClick={() =>
                  setQuery(
                    {
                      x: Math.random(),
                      filters: [...filters, 'foo'],
                      q: 'bar',
                    },
                    'push'
                  )
                }
              >
                Change All
              </button>
            </>
          );
        }}
      </QueryParams>
    </div>
  );
};

export default RenderPropsExample;
```
</details>


### Examples

A few basic [examples](../../examples) have been put together to demonstrate how `useQueryParams` works with different routing systems.

- [React Router 6 Example](../../examples/react-router-6)
- [React Router 5 Example](../../examples/react-router-5)


### API

- [UrlUpdateType](#urlupdatetype)
- [Param Types](#param-types)
- [useQueryParam](#usequeryparam)
- [useQueryParams](#usequeryparams-1)
- [withQueryParams](#withqueryparams)
- [QueryParams](#queryparams)
- [encodeQueryParams](#encodequeryparams)
- [QueryParamProvider](#queryparamprovider)
- [Type Definitions](./src/types.ts) and from [serialize-query-params](../serialize-query-params/src/types.ts).
- [Serialization Utility Functions](../serialize-query-params/src/serialize.ts)

For convenience, use-query-params exports all of the [serialize-query-params](../serialize-query-params) library.

#### UrlUpdateType

The `UrlUpdateType` is a string type definings the different methods for updating the URL:

 - `'pushIn'`: Push just a single parameter, leaving the rest as is (back button works) (the default)
 - `'push'`: Push all parameters with just those specified (back button works)
 - `'replaceIn'`: Replace just a single parameter, leaving the rest as is
 - `'replace'`: Replace all parameters with just those specified
 
#### Param Types
See [all param definitions from serialize-query-params here](../serialize-query-params/src/params.ts). You can define your own parameter types by creating an object with an `encode` and a `decode` function. See the existing definitions for examples.

Note that all null and empty values are typically treated as follows:

Note that with the default searchStringToObject implementation that uses URLSearchParams, null and empty values are treated as follows:

| value | encoding |
| --- | --- |
| `""` | `?qp=` |
| `null` | `?` (removed from URL) |
| `undefined` | `?` (removed from URL) |

If you need a more discerning interpretation, you can use [query-string](https://github.com/sindresorhus/query-string)'s parse and stringify to get:

| value | encoding |
| --- | --- |
| `""` | `?qp=` |
| `null` | `?qp` |
| `undefined` | `?` (removed from URL) |



Examples in this table assume query parameter named `qp`.

| Param | Type | Example Decoded | Example Encoded |
| --- | --- | --- | --- |
| StringParam | string | `'foo'` | `?qp=foo` |
| NumberParam | number | `123` | `?qp=123` |
| ObjectParam | { key: string } | `{ foo: 'bar', baz: 'zzz' }` | `?qp=foo-bar_baz-zzz` |
| ArrayParam | string[] | `['a','b','c']` | `?qp=a&qp=b&qp=c` |
| JsonParam | any | `{ foo: 'bar' }` | `?qp=%7B%22foo%22%3A%22bar%22%7D` |
| DateParam | Date | `Date(2019, 2, 1)` | `?qp=2019-03-01` |
| BooleanParam | boolean | `true` | `?qp=1` |
| NumericObjectParam | { key: number } | `{ foo: 1, bar: 2 }` | `?qp=foo-1_bar-2` |
| DelimitedArrayParam | string[] | `['a','b','c']` | `?qp=a_b_c` |
| DelimitedNumericArrayParam | number[] | `[1, 2, 3]` | `?qp=1_2_3` |

**Example**

```js
import { ArrayParam, useQueryParam, useQueryParams } from 'use-query-params';

// typically used with the hooks:
const [foo, setFoo] = useQueryParam('foo', ArrayParam);
// - OR -
const [query, setQuery] = useQueryParams({ foo: ArrayParam });
```

**Example with Custom Param**

You can define your own params if the ones shipped with this package don't work for you. There are included [serialization utility functions](../serialize-query-params/src/serialize.ts) to make this easier, but you can use whatever you like.

```js
import {
  encodeDelimitedArray,
  decodeDelimitedArray
} from 'use-query-params';

/** Uses a comma to delimit entries. e.g. ['a', 'b'] => qp?=a,b */
const CommaArrayParam = {
  encode: (array: string[] | null | undefined) =>
    encodeDelimitedArray(array, ','),

  decode: (arrayStr: string | string[] | null | undefined) =>
    decodeDelimitedArray(arrayStr, ',')
};
```

<br/>


#### useQueryParam

```js
useQueryParam<T>(name: string, paramConfig?: QueryParamConfig<T>, options?: QueryParamOptions):
  [T | undefined, (newValue: T, updateType?: UrlUpdateType) => void]
```

Given a query param name and query parameter configuration `{ encode, decode }`
return the decoded value and a setter for updating it. If you do not provide a paramConfig, it inherits it from what was defined in the QueryParamProvider, falling back to StringParam if nothing is found.

The setter takes two arguments `(newValue, updateType)` where updateType
is one of `'pushIn' | 'push' | 'replaceIn' | 'replace'`, defaulting to
`'pushIn'`.

You can override options from the QueryParamProvider with the third argument. See [QueryParamOptions](#queryparamoptions) for details.

**Example**

```js
import { useQueryParam, NumberParam } from 'use-query-params';

// reads query parameter `foo` from the URL and stores its decoded numeric value
const [foo, setFoo] = useQueryParam('foo', NumberParam);
setFoo(500);
setFoo(123, 'push');

// to unset or remove a parameter set it to undefined and use pushIn or replaceIn update types
setFoo(undefined) // ?foo=123&bar=zzz becomes ?bar=zzz

// functional updates are also supported:
setFoo((latestFoo) => latestFoo + 150)
```

<br/>

#### useQueryParams

```js
// option 1: pass only a config with possibly some options
useQueryParams<QPCMap extends QueryParamConfigMapWithInherit>(
  paramConfigMap: QPCMap,
  options?: QueryParamOptions
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>];

// option 2: pass an array of param names, relying on predefined params for types
useQueryParams<QPCMap extends QueryParamConfigMapWithInherit>(
  names: string[],
  options?: QueryParamOptions
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>];

// option 3: pass no args, get all params back that were predefined in a proivder
useQueryParams<QPCMap extends QueryParamConfigMapWithInherit>(
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>];
```

Given a query parameter configuration (mapping query param name to `{ encode, decode }`),
return an object with the decoded values and a setter for updating them.

The setter takes two arguments `(newQuery, updateType)` where updateType
is one of `'pushIn' | 'push' | 'replaceIn' | 'replace'`, defaulting to
`'pushIn'`.

You can override options from the QueryParamProvider with the options argument. See [QueryParamOptions](#queryparamoptions) for details.


**Example**

```js
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

// reads query parameters `foo` and `bar` from the URL and stores their decoded values
const [query, setQuery] = useQueryParams({ foo: NumberParam, bar: StringParam });
setQuery({ foo: 500 })
setQuery({ foo: 123, bar: 'zzz' }, 'push');

// to unset or remove a parameter set it to undefined and use pushIn or replaceIn update types
setQuery({ foo: undefined }) // ?foo=123&bar=zzz becomes ?bar=zzz

// functional updates are also supported:
setQuery((latestQuery) => ({ foo: latestQuery.foo + 150 }))
```

**Example with Custom Parameter Type**
Parameter types are just objects with `{ encode, decode }` functions. You can
provide your own if the provided ones don't work for your use case.

```js
import { useQueryParams } from 'use-query-params';

const MyParam = {
  encode(value) {
    return `${value * 10000}`;
  },

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


#### withQueryParams

```js
withQueryParams<QPCMap extends QueryParamConfigMap, P extends InjectedQueryProps<QPCMap>>
  (paramConfigMap: QPCMap, WrappedComponent: React.ComponentType<P>):
      React.FC<Diff<P, InjectedQueryProps<QPCMap>>>
```

Given a query parameter configuration (mapping query param name to `{ encode, decode }`) and
a component, inject the props `query` and `setQuery` into the component based on the config.

The setter takes two arguments `(newQuery, updateType)` where updateType
is one of `'pushIn' | 'push' | 'replaceIn' | 'replace'`, defaulting to
`'pushIn'`.

**Example**

```js
import { withQueryParams, StringParam, NumberParam } from 'use-query-params';

const MyComponent = ({ query, setQuery, ...others }) => {
  const { foo, bar } = query;
  return <div>foo = {foo}, bar = {bar}</div>
}

// reads query parameters `foo` and `bar` from the URL and stores their decoded values
export default withQueryParams({ foo: NumberParam, bar: StringParam }, MyComponent);
```

Note there is also a variant called `withQueryParamsMapped` that allows you to do a react-redux style mapStateToProps equivalent. See [the code](./src/withQueryParams.tsx#L51) or [this example](../../examples/react-router/src/ReadmeExample3Mapped.tsx) for details.

<br/>



#### QueryParams

```js
<QueryParams config={{ foo: NumberParam }}>
  {({ query, setQuery }) => <div>foo = {query.foo}</div>}
</QueryParams>
```

Given a query parameter configuration (mapping query param name to `{ encode, decode }`) and
a component, provide render props `query` and `setQuery` based on the config.

The setter takes two arguments `(newQuery, updateType)` where updateType
is one of `'pushIn' | 'push' | 'replaceIn' | 'replace'`, defaulting to
`'pushIn'`.


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
import { encodeQueryParams, NumberParam } from 'use-query-params';
// since v1.0 stringify is not exported from 'use-query-params',
// so you must install the 'query-string' package in case you need it
import { stringify } from 'query-string';

// encode each parameter according to the configuration
const encodedQuery = encodeQueryParams({ foo: NumberParam }, { foo });
const link = `/?${stringify(encodedQuery)}`;
```

<br/>

#### QueryParamProvider

```js
// choose an adapter, depending on your router
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
<QueryParamProvider adapter={ReactRouter6Adapter}><App /></QueryParamProvider>

// optionally specify options
import { parse, stringify } from 'query-string';
const options = {
  searchStringToObject: parse,
  objectToSearchString: stringify,
}
<QueryParamProvider adapter={ReactRouter6Adapter} options={options}>
  <App />
</QueryParamProvider>

// optionally nest parameters in options to get automatically on useQueryParams calls
<QueryParamProvider adapter={ReactRouter6Adapter} options={{
  params: { foo: NumberParam }
}}>
  <App> {/* useQueryParams calls have access to foo here */}
    ...
    <Page1>
      <QueryParamProvider options={{ params: { bar: BooleanParam }}}>
        ... {/* useQueryParams calls have access to foo and bar here */}
      </QueryParamProvider>
    </Page1>
    ...
  </App>
</QueryParamProvider>
```

The **QueryParamProvider** component links your routing library's history to
the **useQueryParams** hook. It is needed for the hook to be able to update
the URL and have the rest of your app know about it.

You can specify global options at the provider level.

##### QueryParamOptions

| option | default | description |
| --- | --- | --- |
| updateType | "pushIn" | How the URL gets updated by default, one of: replace, replaceIn, push, pushIn. |
| searchStringToObject | from serialize-query-params | How to convert the search string e.g. `?foo=123&bar=x` into an object. Default uses URLSearchParams, but you could also use `parse` from query-string for example. `(searchString: string) => Record<string, string | (string | null)[] | null | undefined>` |
| objectToSearchString | from serialize-query-params | How to convert an object (e.g. `{ foo: 'x' }` -> `foo=x` into a search string – no "?" included). Default uses URLSearchParams, but you could also use `stringify` from query-string for example. `(query: Record<string, string | (string | null)[] | null | undefined>) => string` |
| params | undefined | Define parameters at the provider level to be automatically available to hook calls. Type is QueryParamConfigMap, e.g. `{ params: { foo: NumberParam, bar: BooleanParam }}`
| includeKnownParams | undefined | When true, include all parameters that were configured via the `params` option on a QueryParamProvider. Default behavior depends on the arguments passed to useQueryParams (if not specifying any params, it is true, otherwise false). |
| includeAllParams | false | Include all parameters found in the URL even if not configured in any param config. |
| removeDefaultsFromUrl | false | When true, removes parameters from the URL when set is called if their value is the same as their default (based on the `default` attribute of the Param object, typically populated by `withDefault()`) |
| *enableBatching* | false | **experimental** - turns on batching (i.e., multiple consecutive calls to setQueryParams in a row only result in a single update to the URL). Currently marked as experimental since we need to update all the tests to verify no issues occur, feedback welcome. |





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
