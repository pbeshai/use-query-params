import * as React from 'react';
import {
  withQueryParamsMapped,
  StringParam,
  NumberParam,
  ArrayParam,
  withDefault,
  DecodedValueMap,
  SetQuery,
} from 'use-query-params';

type BaseProps = {
  extra: number;
};
type UrlProps = {
  searchQuery: string;
  num: number;
  filters: string[];
  onChangeNum: (newNum: number) => void;
  setQuery: SetQuery<typeof queryConfig>;
};
type Props = BaseProps & UrlProps;

const UseQueryParamsExample = ({
  searchQuery,
  num,
  filters,
  onChangeNum,
  setQuery,
  extra,
}: Props) => {
  console.log('got filters =', filters, extra);
  return (
    <div>
      <h1>num is {num}</h1>
      <button onClick={() => onChangeNum(Math.random())}>Change</button>
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

const queryConfig = {
  x: NumberParam,
  q: StringParam,
  filters: withDefault(ArrayParam, []),
};

export default withQueryParamsMapped(
  {
    x: NumberParam,
    q: StringParam,
    filters: withDefault(ArrayParam, []),
  },

  function mapToProps(
    query: DecodedValueMap<typeof queryConfig>,
    setQuery: SetQuery<typeof queryConfig>,
    ownProps: BaseProps
  ) {
    return {
      searchQuery: query.q,
      num: query.x,
      filters: query.filters,
      onChangeNum: (newNum: number) => setQuery({ x: newNum }),
      setQuery,
    };
  },
  UseQueryParamsExample
);
