import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  NumberParam,
  StringParam,
  DecodedValueMap,
  EncodedQueryWithNulls,
} from 'serialize-query-params';
import { SetQuery, withQueryParams, QueryParamProvider } from '../index';
import { makeMockHistory, makeMockLocation, calledPushQuery } from './helpers';

// helper to setup tests
function setupWrapper(query: EncodedQueryWithNulls) {
  const location = makeMockLocation(query);
  const history = makeMockHistory(location);
  const wrapper = ({ children }: any) => (
    <QueryParamProvider history={history} location={location}>
      {children}
    </QueryParamProvider>
  );

  return { wrapper, history, location };
}

const queryConfig = { foo: NumberParam, bar: StringParam };

interface Props {
  query: DecodedValueMap<typeof queryConfig>;
  setQuery: SetQuery<typeof queryConfig>;
  other: string;
}

const MockComponent: React.FC<Props> = ({ query, setQuery, other }) => {
  return (
    <div>
      <div>other = {other}</div>
      <div>foo = {query.foo}</div>
      <div>bar = {query.bar}</div>
      <button onClick={() => setQuery({ foo: 99 })}>change foo</button>
    </div>
  );
};

const MockWithHoc = withQueryParams(queryConfig, MockComponent);

describe('withQueryParams', () => {
  afterEach(cleanup);

  it('works', () => {
    const { wrapper, history } = setupWrapper({
      foo: '123',
      bar: 'xxx',
    });
    const { getByText } = render(<MockWithHoc other="zing" />, {
      wrapper,
    });

    expect(getByText(/other = zing/)).toBeInTheDocument();
    expect(getByText(/foo = 123/)).toBeInTheDocument();
    expect(getByText(/bar = xxx/)).toBeInTheDocument();
    getByText(/change foo/).click();
    expect(calledPushQuery(history, 0)).toEqual({ foo: '99', bar: 'xxx' });
  });
});
