import * as React from 'react';
import { ParsedQuery } from 'query-string';
import { renderHook, cleanup } from 'react-hooks-testing-library';
import { useQueryParams, QueryParamProvider } from '../index';
import {
  makeMockHistory,
  makeMockLocation,
  calledPushQuery,
  calledReplaceQuery,
} from './helpers';
import { NumberParam, ArrayParam, StringParam } from '../params';

// helper to setup tests
function setupWrapper(query: ParsedQuery) {
  const location = makeMockLocation(query);
  const history = makeMockHistory(location);
  const wrapper = ({ children }: any) => (
    <QueryParamProvider history={history} location={location}>
      {children}
    </QueryParamProvider>
  );

  return { wrapper, history, location };
}

describe('useQueryParams', () => {
  afterEach(cleanup);

  it('default update type (replaceIn)', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(() => useQueryParams({ foo: StringParam }), {
      wrapper,
    });
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ foo: '123' });
    setter({ foo: 'zzz' });
    expect(calledReplaceQuery(history, 0)).toEqual({ foo: 'zzz', bar: 'xxx' });
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
    expect(calledPushQuery(history, 0)).toEqual({ foo: '555', baz: 'a_b' });
  });

  it('ignores unconfigured parameter', () => {
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
    expect(calledPushQuery(history, 0)).toEqual({ foo: '555' });
  });
});
