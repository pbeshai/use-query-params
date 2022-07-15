import '@testing-library/jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import {
  DecodedValueMap,
  EncodedQuery,
  NumberParam,
  StringParam,
  objectToSearchString,
} from 'serialize-query-params';
import {
  QueryParamAdapter,
  QueryParamProvider,
  SetQuery,
  withQueryParams,
} from '../index';
import { calledPushQuery, makeMockAdapter } from './helpers';

// helper to setup tests
function setupWrapper(query: EncodedQuery) {
  const Adapter = makeMockAdapter({ search: objectToSearchString(query) });
  const adapter = (Adapter as any).adapter as QueryParamAdapter;
  const wrapper = ({ children }: any) => (
    <QueryParamProvider adapter={Adapter}>{children}</QueryParamProvider>
  );

  return { wrapper, adapter };
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
    const { wrapper, adapter } = setupWrapper({
      foo: '123',
      bar: 'xxx',
    });
    const { getByText } = render(<MockWithHoc other="zing" />, {
      wrapper,
    });

    // @ts-ignore
    expect(getByText(/other = zing/)).toBeInTheDocument();
    // @ts-ignore
    expect(getByText(/foo = 123/)).toBeInTheDocument();
    // @ts-ignore
    expect(getByText(/bar = xxx/)).toBeInTheDocument();
    getByText(/change foo/).click();
    expect(calledPushQuery(adapter, 0)).toEqual({ foo: '99', bar: 'xxx' });
  });
});
