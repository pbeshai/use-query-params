import * as React from 'react';
import { cleanup, renderHook } from '@testing-library/react-hooks';
import {
  EncodedQuery,
  NumberParam,
  NumericArrayParam,
  DateParam,
  JsonParam,
} from 'serialize-query-params';
import { QueryParamProvider, useQueryParam } from '../index';
import { calledPushQuery, makeMockHistory, makeMockLocation } from './helpers';
import { describe, it, vi, test } from 'vitest';

// helper to setup tests
function setupWrapper(query: EncodedQuery) {
  const location = makeMockLocation(query);
  const history = makeMockHistory(location);
  const wrapper = ({ children }: any) => (
    <QueryParamProvider
      history={history}
      location={{ ...location }} // generate a new location each time to reproduce #46
    >
      {children}
    </QueryParamProvider>
  );

  return { wrapper, history, location };
}

describe('useQueryParam', () => {
  afterEach(cleanup);

  it('default param type (string, pushIn)', () => {
    const { wrapper, history } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(() => useQueryParam('foo'), { wrapper });
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toBe('123');
    setter('zzz');
    expect(calledPushQuery(history, 0)).toEqual({ foo: 'zzz', bar: 'xxx' });
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
    const { wrapper, location } = setupWrapper({
      foo: ['1', '2', '3'],
    });
    const { result, rerender } = renderHook(
      () => useQueryParam('foo', NumericArrayParam),
      {
        wrapper,
      }
    );

    const [decodedValue] = result.current;
    expect(decodedValue).toEqual([1, 2, 3]);

    rerender();
    const [decodedValue2, setter2] = result.current;
    expect(decodedValue).toBe(decodedValue2);

    setter2([4, 5, 6], 'replaceIn');
    rerender();
    const [decodedValue3, setter3] = result.current;
    expect(decodedValue3).toEqual([4, 5, 6]);
    expect(decodedValue).not.toBe(decodedValue3);

    setter3([4, 5, 6], 'push');
    rerender();
    const [decodedValue4] = result.current;
    expect(decodedValue3).toBe(decodedValue4);

    // if another parameter changes, this one shouldn't be affected
    location.search = `${location.search}&zzz=123`;
    rerender();
    const [decodedValue5] = result.current;
    expect(decodedValue5).toBe(decodedValue3);
  });

  it('does not generate a new setter with each new query value', () => {
    const { wrapper } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result, rerender } = renderHook(
      () => useQueryParam('foo', NumberParam),
      {
        wrapper,
      }
    );
    const [, setter] = result.current;

    setter(999, 'push');
    rerender();
    const [, setter2] = result.current;
    expect(setter).toBe(setter2);
  });

  it('does not generate a new setter with each new parameter type', () => {
    const { wrapper } = setupWrapper({ foo: '123' });
    const { result, rerender } = renderHook(
      () => useQueryParam('foo', { ...NumberParam }),
      {
        wrapper,
      }
    );
    const [, setter] = result.current;
    rerender();
    const [, setter2] = result.current;
    expect(setter).toBe(setter2);
  });

  it('sets distinct params in the same render', () => {
    const { wrapper } = setupWrapper({
      foo: '1',
      bar: '1',
    });
    const { result, rerender } = renderHook(
      () => [
        useQueryParam('foo', NumberParam),
        useQueryParam('bar', NumberParam),
      ],
      { wrapper }
    );
    const [[foo1, setFoo], [bar1, setBar]] = result.current;
    expect([foo1, bar1]).toEqual([1, 1]);

    setFoo(2, 'replaceIn');
    setBar(2, 'replaceIn');
    rerender();

    const [[foo2], [bar2]] = result.current;
    expect([foo2, bar2]).toEqual([2, 2]); // Fails, instead receiving [1, 2]
  });

  it('works with functional updates', () => {
    const { wrapper, history, location } = setupWrapper({
      foo: '123',
      bar: 'xxx',
    });
    const { result, rerender } = renderHook(
      () => useQueryParam('foo', NumberParam),
      {
        wrapper,
      }
    );
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toBe(123);
    setter((latestValue) => latestValue! + 100, 'push');
    expect(calledPushQuery(history, 0)).toEqual({ foo: '223' });

    setter((latestValue) => latestValue! + 110, 'push');
    expect(calledPushQuery(history, 1)).toEqual({ foo: '333' });

    // use a stale setter
    location.search = '?foo=500';
    rerender();
    setter((latestValue) => latestValue! + 100, 'push');
    expect(calledPushQuery(history, 2)).toEqual({ foo: '600' });
  });

  it('works with functional JsonParam updates', () => {
    type ParamType = { a: number; b: string };
    const { wrapper, history } = setupWrapper({
      foo: '{"a":1,"b":"abc"}',
      bar: 'xxx',
    });
    const { result } = renderHook(() => useQueryParam('foo', JsonParam), {
      wrapper,
    });
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toEqual({ a: 1, b: 'abc' });
    setter(
      (latestValue: ParamType) => ({ ...latestValue, a: latestValue.a + 1 }),
      'push'
    );
    expect(calledPushQuery(history, 0)).toEqual({ foo: '{"a":2,"b":"abc"}' });

    setter((latestValue: ParamType) => ({ ...latestValue, b: 'yyy' }), 'push');
    expect(calledPushQuery(history, 1)).toEqual({ foo: '{"a":2,"b":"yyy"}' });
  });

  it('properly detects new values when equals is overridden', () => {
    const { wrapper } = setupWrapper({
      foo: '2020-01-01',
    });
    const { result, rerender } = renderHook(
      () => useQueryParam('foo', DateParam),
      {
        wrapper,
      }
    );

    const [decodedValue, setter] = result.current;
    expect(decodedValue).toEqual(new Date(2020, 0, 1));

    setter(new Date(2020, 0, 2));
    rerender();
    const [decodedValue2, setter2] = result.current;
    expect(decodedValue2).toEqual(new Date(2020, 0, 2));
    // expect(decodedValue).not.toBe(decodedValue3);

    setter2(new Date(2020, 0, 2));
    rerender();
    const [decodedValue3] = result.current;
    expect(decodedValue3).toBe(decodedValue2);
  });

  it.skip('reuses decoded value', () => {
    const { wrapper } = setupWrapper({
      foo: '1',
    });
    const { result } = renderHook(
      () => [
        useQueryParam('foo', NumericArrayParam),
        useQueryParam('foo', NumericArrayParam),
      ],
      { wrapper }
    );
    const [[foo1], [foo2]] = result.current;
    expect([foo1, foo2]).toEqual([[1], [1]]);
    expect(foo1).toBe(foo2);
  });
});
