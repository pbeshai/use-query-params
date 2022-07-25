<div align="center">
  <h1>serialize-query-params</h1>
  <p>A library for simplifying encoding and decoding URL query parameters.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/serialize-query-params"><img alt="npm" src="https://img.shields.io/npm/v/serialize-query-params.svg"></a>
    <a href="https://travis-ci.com/pbeshai/serialize-query-params"><img alt="Travis (.com)" src="https://img.shields.io/travis/com/pbeshai/serialize-query-params.svg"></a>
  </p>
<hr />

<a href="#installation">Installation</a> | 
<a href="#api">API</a> |
<a href="https://pbeshai.github.io/use-query-params/">useQueryParams</a>

</div>
<hr/>

Used in React with [use-query-params](../use-query-params).

### Installation

Using npm:

```
$ npm install --save serialize-query-params
```

By default, serialize-query-params uses [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) to handle interpreting the location string, which means it does not decode `null` and has limited handling of other more advanced URL parameter configurations. If you want access to those features, add a third-party library like [query-string](https://github.com/sindresorhus/query-string) and provide its functions to updateLocation and updateInLocation as needed.

### API

- [Param Types](#param-types)
- [decodeQueryParams](#decodequeryparams)
- [encodeQueryParams](#encodequeryparams)
- [searchStringToObject](#searchstringtoobject)
- [objectToSearchString](#objecttosearchstring)
- [updateLocation](#updatelocation)
- [updateInLocation](#updateinlocation)
- [Type Definitions](./src/types.ts)
- [Serialization Utility Functions](./src/serialize.ts)




#### Param Types
See [all param definitions here](./src/params.ts). You can define your own parameter types by creating an object with an `encode` and a `decode` function. See the existing definitions for examples.

Note that all null and empty values are typically treated as follows:

| value | encoding |
| --- | --- |
| `null` | `?foo` |
| `""` | `?foo=` |
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
| DateTimeParam | Date | `Date(2019, 2, 1)` | `?qp=2019-02-28T22:00:00.000Z` |
| BooleanParam | boolean | `true` | `?qp=1` |
| NumericObjectParam | { key: number } | `{ foo: 1, bar: 2 }` | `?qp=foo-1_bar-2` |
| DelimitedArrayParam | string[] | `['a','b','c']` | `?qp=a_b_c'` |
| DelimitedNumericArrayParam | number[] | `[1, 2, 3]` | `?qp=1_2_3'` |

**Enum Param**

You can define enum param using `createEnumParam`. It works as `StringParam` but restricts decoded output to a list of allowed strings: 

```js
import { createEnumParam } from 'serialize-query-params';

// values other than 'asc' or 'desc' will be decoded as undefined
const SortOrderEnumParam = createEnumParam(['asc', 'desc'])
```

**Array Enum Param**

You can define array enum param using `createEnumArrayParam` or `createEnumDelimitedArrayParam`. It will restricts decoded output to a list of allowed values. 

```js
import { createEnumArrayParam } from 'serialize-query-params';

// feel free to use Enum instead of union types
type Color = 'red' | 'green' | 'blue'

// values other than 'red', 'green' or 'blue' will be decoded as undefined
const ColorArrayEnumParam = createEnumArrayParam<Color[]>(['red', 'green', 'blue'])
```


**Setting a default value**

If you'd like to have a default value, you can wrap your param with `withDefault()`:

```js
import { withDefault, ArrayParam } from 'serialize-query-params';

// by default, nulls are converted to defaults
const NeverNullArrayParam = withDefault(ArrayParam, []);

// if you don't want nulls to be included, pass false as a third arg
const NeverUndefinedArrayParam = withDefault(ArrayParam, [], false);
```

**Example with Custom Param**

You can define your own params if the ones shipped with this package don't work for you. There are included [serialization utility functions](./src/serialize.ts) to make this easier, but you can use whatever you like.

```js
import {
  encodeDelimitedArray,
  decodeDelimitedArray
} from 'serialize-query-params';

/** Uses a comma to delimit entries. e.g. ['a', 'b'] => qp?=a,b */
const CommaArrayParam = {
  encode: (array: string[] | null | undefined): string | undefined => 
    encodeDelimitedArray(array, ','),

  decode: (arrayStr: string | string[] | null | undefined): string[] | undefined => 
    decodeDelimitedArray(arrayStr, ',')
};
```

<br/>

#### decodeQueryParams

```js
decodeQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  encodedQuery: Partial<EncodedValueMap<QPCMap>>
): Partial<DecodedValueMap<QPCMap>>
```

Convert the values in query from strings to their natural types via the
decode functions configured in paramConfigMap. 

**Example**

```js
import {
  stringify,
  decodeQueryParams,
  NumberParam,
  DelimitedArrayParam
} from 'serialize-query-params';

// encode each parameter according to the configuration
const decodedQuery = decodeQueryParams(
  { foo: NumberParam, bar: DelimitedArrayParam },
  { foo: '123', bar: 'a_b' }
);
// produces: { foo: 123, bar: ['a', 'b'] }
```

<br/>


#### encodeQueryParams

```js
encodeQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  query: Partial<DecodedValueMap<QPCMap>>
): Partial<EncodedValueMap<QPCMap>>
```

Convert the values in query to strings via the encode functions configured
in paramConfigMap. This can be useful for constructing links using decoded
query parameters.

**Example**

```js
import {
  encodeQueryParams,
  DelimitedArrayParam,
  NumberParam,
} from 'serialize-query-params';
import { stringify } from 'query-string';

// encode each parameter according to the configuration
const encodedQuery = encodeQueryParams(
  { foo: NumberParam, bar: DelimitedArrayParam },
  { foo: 123, bar: ['a', 'b'] }
);
// produces: { foo: '123', bar: 'a_b' }

const link = `/?${stringify(encodedQuery)}`;
```

<br/>



#### searchStringToObject

```js
function searchStringToObject(searchString: string): EncodedQuery 
```
Default implementation of searchStringToObject powered by URLSearchParams
This converts a search string like `?foo=123&bar=x` to { foo: '123', bar: 'x' }
This is only a very basic version, you may prefer the advanced versions offered
by third party libraries like query-string ("parse") or qs.

**Example**

```js
import { searchStringToObject } from 'serialize-query-params';

const obj = searchStringToObject('?foo=a&bar=x&foo=z');
// -> { foo: ['a', 'z'], bar: 'x'}
```

<br/>


#### objectToSearchString

```js
function objectToSearchString(encodedParams: EncodedQuery): string 
```

Default implementation of objectToSearchString powered by URLSearchParams.
Does not support null values. Does not prefix with "?"
This converts an object { foo: '123', bar: 'x' } to a search string `?foo=123&bar=x`
This is only a very basic version, you may prefer the advanced versions offered
by third party libraries like query-string ("stringify") or qs.

**Example**

```js
import { objectToSearchString } from 'serialize-query-params';

const obj = objectToSearchString({ foo: ['a', 'z'], bar: 'x' });
// '?foo=a&foo=z&bar=x'
```

<br/>

#### updateLocation

```js
function updateLocation(
  encodedQuery: EncodedQuery,
  location: Location,
  objectToSearchStringFn = objectToSearchString
): Location {
```

Creates a new location-like object with the new query string (the `search` field) 
based on the encoded query parameters passed in via `encodedQuery`. Parameters not
specified in `encodedQuery` will be dropped from the URL.

**Example**

```js
import { updateLocation } from 'serialize-query-params';

// location has search: ?foo=123&bar=abc
const newLocation = updateLocation({ foo: '555' }, location);

// newLocation has search: ?foo=555
// note that unspecified query parameters (bar in this case) are not retained.
```

<br/>


#### updateInLocation

```js
function updateInLocation(
  encodedQueryReplacements: EncodedQuery,
  location: Location,
  objectToSearchStringFn = objectToSearchString,
  searchStringToObjectFn = searchStringToObject
): Location {
```

Creates a new location-like object with the new query string (the `search` field) 
based on the encoded query parameters passed in via `encodedQueryReplacements`. Only
parameters specified in `encodedQueryReplacements` are affected by this update,
all other parameters are retained.

**Example**

```js
import { updateInLocation } from 'serialize-query-params';

// location has search: ?foo=123&bar=abc
const newLocation = updateLocation({ foo: '555' }, location);

// newLocation has search: ?foo=555&bar=abc
// note that unspecified query parameters (bar in this case) are retained.
```

<br/>



### Development

Run the typescript compiler in watch mode:

```
npm run dev
```

