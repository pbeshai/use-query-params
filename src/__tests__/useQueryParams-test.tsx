import * as React from 'react';
import { renderHook, cleanup } from 'react-hooks-testing-library';
import {
  NumberParam,
  ArrayParam,
  StringParam,
  EncodedQueryWithNulls,
} from 'serialize-query-params';

import { useQueryParams, QueryParamProvider } from '../index';
import {
  makeMockHistory,
  makeMockLocation,
  calledPushQuery,
  calledReplaceQuery,
} from './helpers';

// helper to setup tests
function setupWrapper(query: EncodedQueryWithNulls) {
  const location = makeMockLocation(query);
  const history = makeMockHistory(location);
  const wrapper = ({ children }: any) => (
    <QueryParamProvider history={history} location={{ ...location }}>
      {children}
    </QueryParamProvider>
  );

  return { wrapper, history, location };
}

describe('useQueryParams', () => {
  afterEach(cleanup);

  it('default update type (pushIn)', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(() => useQueryParams({ foo: StringParam }), {
      wrapper,
    });
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ foo: '123' });
    setter({ foo: 'zzz' });
    expect(calledPushQuery(history, 0)).toEqual({ foo: 'zzz', bar: 'xxx' });
  });

  it('multiple params', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(
      () =>
        useQueryParams({ foo: NumberParam, bar: StringParam, baz: ArrayParam }),
      {
        wrapper,
      }
    );
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ foo: 123, bar: 'xxx' });
    setter({ foo: 555, baz: ['a', 'b'] }, 'push');
    expect(calledPushQuery(history, 0)).toEqual({
      foo: '555',
      baz: ['a', 'b'],
    });
  });

  it('passes through unconfigured parameter as a string', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(
      () => useQueryParams({ foo: NumberParam, bar: StringParam }),
      {
        wrapper,
      }
    );
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ foo: 123, bar: 'xxx' });
    setter({ foo: 555, baz: ['a', 'b'] } as any, 'push');
    expect(calledPushQuery(history, 0)).toEqual({
      foo: '555',
      baz: 'a,b', // ['a,'b'] as string = "a,b"
    });
  });

  it('return persistent value if search not changed', () => {
    const { wrapper } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: NumberParam, bar: StringParam }),
      {
        wrapper,
      }
    );
    const [decodedQuery1] = result.current;
    rerender();
    const [decodedQuery2] = result.current;
    expect(decodedQuery1 === decodedQuery2).toBe(true);
  });

  it('does not generate a new setter with each new query value', () => {
    const { wrapper } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: NumberParam, bar: StringParam }),
      {
        wrapper,
      }
    );
    const [, setter] = result.current;

    setter({ foo: 999 }, 'push');
    rerender();
    const [, setter2] = result.current;
    expect(setter).toBe(setter2);
  });
});
