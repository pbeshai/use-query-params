import * as React from 'react';
import {
  QueryParams,
  StringParam,
  NumberParam,
  ArrayParam,
} from 'use-query-params';

const RenderPropsExample = () => {
  const queryConfig = {
    x: NumberParam,
    q: StringParam,
    filters: ArrayParam,
  };
  return (
    <div>
      <QueryParams config={queryConfig}>
        {({ query, setQuery }) => {
          const { x: num, q: searchQuery, filters = [] } = query;
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
