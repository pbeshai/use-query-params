import * as React from 'react';
import { renderHook, cleanup } from '@testing-library/react-hooks';
import {
  NumberParam,
  ArrayParam,
  StringParam,
  EncodedQuery,
  NumericArrayParam,
  DateParam,
  JsonParam,
} from 'serialize-query-params';
import { describe, it, vi } from 'vitest';

import {
  useQueryParams,
  QueryParamProvider,
  QueryParamAdapter,
} from '../index';
import { calledPushQuery, makeMockAdapter } from './helpers';
import { stringifyParams } from '../stringifyParams';

// helper to setup tests
function setupWrapper(query: EncodedQuery) {
  const Adapter = makeMockAdapter({ search: stringifyParams(query) });
  const adapter = (Adapter as any).adapter as QueryParamAdapter;
  const wrapper = ({ children }: any) => (
    <QueryParamProvider Adapter={Adapter}>{children}</QueryParamProvider>
  );

  return { wrapper, adapter };
}

describe('useQueryParams', () => {
  afterEach(cleanup);
  it('default update type (pushIn)', () => {
    const { wrapper, adapter } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(() => useQueryParams({ foo: StringParam }), {
      wrapper,
    });
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ foo: '123' });
    setter({ foo: 'zzz' });
    expect(calledPushQuery(adapter, 0)).toEqual({ foo: 'zzz', bar: 'xxx' });
  });

  it('multiple params', () => {
    const { wrapper, adapter } = setupWrapper({ foo: '123', bar: 'xxx' });
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
    expect(calledPushQuery(adapter, 0)).toEqual({
      foo: '555',
      baz: ['a', 'b'],
    });
  });

  it('passes through unconfigured parameter as a string', () => {
    const { wrapper, adapter } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result } = renderHook(
      () => useQueryParams({ foo: NumberParam, bar: StringParam }),
      {
        wrapper,
      }
    );
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ foo: 123, bar: 'xxx' });
    setter({ foo: 555, baz: ['a', 'b'] } as any, 'push');
    expect(calledPushQuery(adapter, 0)).toEqual({
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
    expect(decodedQuery1).toBe(decodedQuery2);
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

  it('does not generate a new setter with each new parameter type', () => {
    const { wrapper } = setupWrapper({ foo: '123' });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: { ...NumberParam } }),
      {
        wrapper,
      }
    );
    const [, setter] = result.current;
    rerender();
    const [, setter2] = result.current;
    expect(setter).toBe(setter2);
  });

  it("doesn't decode more than necessary", () => {
    const { wrapper } = setupWrapper({
      foo: ['1', '2', '3'],
      bar: ['a', 'b'],
    });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: NumericArrayParam, bar: ArrayParam }),
      {
        wrapper,
      }
    );

    const [decodedValue] = result.current;
    expect(decodedValue).toEqual({ foo: [1, 2, 3], bar: ['a', 'b'] });

    rerender();
    const [decodedValue2, setter2] = result.current;
    expect(decodedValue.foo).toBe(decodedValue2.foo);
    expect(decodedValue.bar).toBe(decodedValue2.bar);
    expect(decodedValue).toBe(decodedValue2);

    setter2({ foo: [4, 5, 6] }, 'replaceIn');
    rerender();
    const [decodedValue3, setter3] = result.current;
    expect(decodedValue).not.toBe(decodedValue3);
    expect(decodedValue3.foo).toEqual([4, 5, 6]);
    expect(decodedValue3.bar).toBe(decodedValue.bar);

    setter3({ foo: [4, 5, 6] }, 'pushIn');
    rerender();
    const [decodedValue4, setter4] = result.current;
    expect(decodedValue3.foo).toBe(decodedValue4.foo);
    expect(decodedValue3.bar).toBe(decodedValue4.bar);
    expect(decodedValue3).toBe(decodedValue4);

    // if another parameter changes, this one shouldn't be affected
    setter4({ bar: ['x', 'd'] });
    rerender();
    const [decodedValue5] = result.current;
    expect(decodedValue5.foo).toBe(decodedValue3.foo);
    expect(decodedValue5.bar).toEqual(['x', 'd']);
  });

  it('allows the config to change over time', () => {
    const { wrapper, adapter } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result, rerender } = renderHook(
      ({ config }) => useQueryParams(config),
      {
        wrapper,
        initialProps: {
          config: {
            foo: NumberParam,
            bar: StringParam,
            baz: ArrayParam,
          } as any,
        },
      }
    );
    let decodedQuery = result.current[0];
    let setter = result.current[1];

    expect(decodedQuery).toEqual({ foo: 123, bar: 'xxx' });
    setter({ foo: 555, baz: ['a', 'b'] }, 'push');
    expect(calledPushQuery(adapter, 0)).toEqual({
      foo: '555',
      baz: ['a', 'b'],
    });

    rerender({
      config: {
        foo: StringParam,
        newt: NumberParam,
        bar: StringParam,
        baz: ArrayParam,
      },
    });
    decodedQuery = result.current[0];
    setter = result.current[1];

    expect(decodedQuery).toEqual({ foo: '555', baz: ['a', 'b'] });
    setter({ foo: '99', baz: null, bar: 'regen', newt: 1000 });
    expect(calledPushQuery(adapter, 1)).toEqual({
      foo: '99',
      baz: null,
      bar: 'regen',
      newt: '1000',
    });
  });

  it('sets distinct params in the same render', () => {
    const { wrapper } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: NumberParam, bar: StringParam }),
      {
        wrapper,
      }
    );
    const [, setter] = result.current;

    setter({ foo: 999 }, 'replaceIn');
    setter({ bar: 'yyy' }, 'replaceIn');
    rerender();
    const [decodedQuery] = result.current;
    expect(decodedQuery).toEqual({ foo: 999, bar: 'yyy' });
  });

  it('sets distinct params with different hooks in the same render', () => {
    const { wrapper } = setupWrapper({ foo: '123', bar: 'xxx' });
    const { result, rerender } = renderHook(
      () => [
        useQueryParams({ foo: NumberParam }),
        useQueryParams({ bar: StringParam }),
      ],
      {
        wrapper,
      }
    );
    const [[, setFoo], [, setBar]] = result.current;

    setFoo({ foo: 999 }, 'replaceIn');
    setBar({ bar: 'yyy' }, 'replaceIn');
    rerender();
    const [[{ foo }], [{ bar }]] = result.current as any;
    expect({ foo, bar }).toEqual({ foo: 999, bar: 'yyy' });
  });

  it('works with functional updates', () => {
    const { wrapper, adapter } = setupWrapper({
      foo: '123',
      bar: ['a', 'b'],
    });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: NumberParam, bar: ArrayParam }),
      {
        wrapper,
      }
    );
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toEqual({ foo: 123, bar: ['a', 'b'] });
    setter(
      (latestQuery: any) => ({
        foo: latestQuery.foo + 100,
      }),
      'pushIn'
    );
    expect(calledPushQuery(adapter, 0)).toEqual({
      foo: '223',
      bar: ['a', 'b'],
    });

    setter((latestQuery: any) => ({ foo: latestQuery.foo + 110 }), 'pushIn');
    expect(calledPushQuery(adapter, 1)).toEqual({
      foo: '333',
      bar: ['a', 'b'],
    });

    // use a stale setter
    (adapter.getCurrentLocation() as any).search = '?foo=500';
    rerender();
    setter((latestQuery: any) => ({ foo: latestQuery.foo + 100 }), 'push');
    expect(calledPushQuery(adapter, 2)).toEqual({ foo: '600' });
  });

  it('works with functional JsonParam updates', () => {
    const { wrapper, adapter } = setupWrapper({
      foo: '{"a":1,"b":"abc"}',
      bar: 'xxx',
    });
    const { result } = renderHook(
      () => useQueryParams({ foo: JsonParam, bar: StringParam }),
      {
        wrapper,
      }
    );
    const [decodedValue, setter] = result.current;

    expect(decodedValue).toEqual({ foo: { a: 1, b: 'abc' }, bar: 'xxx' });
    setter(
      (latestQuery: any) => ({
        foo: { ...latestQuery.foo, a: latestQuery.foo.a + 1 },
      }),
      'pushIn'
    );
    expect(calledPushQuery(adapter, 0)).toEqual({
      foo: '{"a":2,"b":"abc"}',
      bar: 'xxx',
    });
  });

  it('properly detects new values when equals is overridden', () => {
    const { wrapper } = setupWrapper({
      foo: '2020-01-01',
    });
    const { result, rerender } = renderHook(
      () => useQueryParams({ foo: DateParam }),
      {
        wrapper,
      }
    );

    const [decodedValue, setter] = result.current;
    expect(decodedValue.foo).toEqual(new Date(2020, 0, 1));

    setter({ foo: new Date(2020, 0, 2) });
    rerender();
    const [decodedValue2, setter2] = result.current;
    expect(decodedValue2.foo).toEqual(new Date(2020, 0, 2));
    // expect(decodedValue).not.toBe(decodedValue3);

    setter2({ foo: new Date(2020, 0, 2) });
    rerender();
    const [decodedValue3] = result.current;
    expect(decodedValue3.foo).toBe(decodedValue2.foo);
  });

  describe.skip('should call custom paramConfig.decode properly', () => {
    it('when custom paramConfig decode undefined as non-undefined value, should not call decode function when irrelevant update happens', () => {
      const { wrapper } = setupWrapper({ bar: '1' });
      const customQueryParam = {
        encode: (str: string | undefined | null) => str,
        decode: (str: string | (string | null)[] | undefined | null) => {
          if (str === undefined) {
            return null;
          }
          return str;
        },
      };
      const decodeSpy = vi.spyOn(customQueryParam, 'decode');
      const { result, rerender } = renderHook(
        () => useQueryParams({ foo: customQueryParam, bar: StringParam }),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ foo: null, bar: '1' });
      expect(decodeSpy).toHaveBeenCalledTimes(1);

      setter({ bar: '2' });
      rerender();
      setter({ bar: '3' });
      rerender();
      expect(decodeSpy).toHaveBeenCalledTimes(1);
    });

    it('when custom paramConfig decode undefined as undefined, should call decode function when irrelevant update happens', () => {
      const { wrapper } = setupWrapper({ bar: '1' });
      const customQueryParam = {
        encode: (str: string | undefined | null) => str,
        decode: (str: string | (string | null)[] | undefined | null) => str,
      };

      const decodeSpy = vi.spyOn(customQueryParam, 'decode');
      const { result, rerender } = renderHook(
        () => useQueryParams({ foo: customQueryParam, bar: StringParam }),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ foo: undefined, bar: '1' });
      expect(decodeSpy).toHaveBeenCalledTimes(1);

      setter({ bar: '2' });
      rerender();
      setter({ bar: '3' });
      rerender();
      expect(decodeSpy).toHaveBeenCalledTimes(3);
    });
  });
});
