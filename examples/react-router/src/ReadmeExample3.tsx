import * as React from 'react';
import {
  withQueryParams,
  StringParam,
  NumberParam,
  ArrayParam,
} from 'use-query-params';

const UseQueryParamsExample = ({ query, setQuery }: any) => {
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

export default withQueryParams({
  x: NumberParam,
  q: StringParam,
  filters: ArrayParam,
})(UseQueryParamsExample);
