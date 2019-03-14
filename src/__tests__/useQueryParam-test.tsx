import * as React from 'react';
import { ParsedQuery } from 'query-string';
import { renderHook, cleanup, act } from 'react-hooks-testing-library';
import { useQueryParam, QueryParamProvider } from '../index';
import {
  makeMockHistory,
  makeMockLocation,
  calledPushQuery,
  calledReplaceQuery,
} from './helpers';
import { NumberParam, ArrayParam } from '../params';

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

describe('useQueryParam', () => {
  afterEach(cleanup);

  it('default param type (string, replaceIn)', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(() => useQueryParam('foo'), { wrapper });
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toBe('123');
    setter('zzz');
    expect(calledReplaceQuery(history, 0)).toEqual({ foo: 'zzz', bar: 'xxx' });
  });

  it('specific param type and update type', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(() => useQueryParam('foo', NumberParam), {
      wrapper,
    });
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toBe(123);
    setter(999, 'push');
    expect(calledPushQuery(history, 0)).toEqual({ foo: '999' });
  });

  it("doesn't decode more than necessary", () => {
    const { wrapper, history, location } = setupWrapper({ foo: 'a_b_c' });
    const { result, rerender } = renderHook(
      () => useQueryParam('foo', ArrayParam),
      {
        wrapper,
      }
    );

    const [decodedValue, setter] = result.current;
    expect(decodedValue).toEqual(['a', 'b', 'c']);

    rerender();
    const [decodedValue2, setter2] = result.current;
    expect(decodedValue).toBe(decodedValue2);

    setter2(['d', 'e', 'f'], 'replaceIn');
    rerender();
    const [decodedValue3, setter3] = result.current;
    expect(decodedValue).not.toBe(decodedValue3);
    expect(decodedValue3).toEqual(['d', 'e', 'f']);
  });
});
