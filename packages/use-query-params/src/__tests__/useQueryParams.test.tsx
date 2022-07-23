import * as React from 'react';
import * as qs from 'query-string';
import { renderHook, cleanup } from '@testing-library/react-hooks';
import {
  NumberParam,
  ArrayParam,
  StringParam,
  EncodedQuery,
  NumericArrayParam,
  DateParam,
  JsonParam,
  BooleanParam,
  withDefault,
  objectToSearchString,
} from 'serialize-query-params';
import { describe, it, vi } from 'vitest';

import {
  useQueryParams,
  QueryParamProvider,
  QueryParamAdapter,
  QueryParamOptions,
} from '../index';
import { calledPushQuery, makeMockAdapter } from './helpers';

// helper to setup tests
function setupWrapper(query: EncodedQuery, options?: QueryParamOptions) {
  const Adapter = makeMockAdapter({ search: objectToSearchString(query) });
  const adapter = (Adapter as any).adapter as QueryParamAdapter;
  const wrapper = ({ children }: any) => (
    <QueryParamProvider adapter={Adapter} options={options}>
      {children}
    </QueryParamProvider>
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
    const { wrapper, adapter } = setupWrapper(
      { foo: '123', bar: 'xxx' },
      { searchStringToObject: qs.parse, objectToSearchString: qs.stringify }
    );
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
    rerender();
    const [decodedQuery] = result.current;
    expect(decodedQuery).toEqual({ foo: 999, bar: 'xxx' });
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
    (adapter.location as any).search = '?foo=500';
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

  it('allows updating params that werent directly configured', () => {
    const { wrapper, adapter } = setupWrapper({
      known: 'foo',
      unknown: 'bar',
    });
    const { result } = renderHook(
      () => useQueryParams({ known: StringParam }),
      {
        wrapper,
      }
    );

    const [decodedValue, setter] = result.current;
    expect(decodedValue).toEqual({ known: 'foo' });
    setter({ unknown: 'zzz', nothing: 'xx' } as any);
    expect(calledPushQuery(adapter, 0)).toEqual({
      known: 'foo',
      unknown: 'zzz',
      nothing: 'xx',
    });
  });

  it('supports alternative urlName config', () => {
    const { wrapper, adapter } = setupWrapper({ q: 'my search' });
    const { result, rerender } = renderHook(
      () => useQueryParams({ searchQuery: { ...StringParam, urlName: 'q' } }),
      {
        wrapper,
      }
    );
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ searchQuery: 'my search' });
    setter({ searchQuery: 'yours' });
    expect(calledPushQuery(adapter, 0)).toEqual({
      q: 'yours',
    });
    rerender();
    const [decodedQuery2] = result.current;
    expect(decodedQuery2).toEqual({ searchQuery: 'yours' });
  });

  it('supports inherited urlName config', () => {
    const { wrapper, adapter } = setupWrapper(
      { q: 'my search' },
      { params: { searchQuery: { ...StringParam, urlName: 'q' } } }
    );
    const { result, rerender } = renderHook(() => useQueryParams(), {
      wrapper,
    });
    const [decodedQuery, setter] = result.current;

    expect(decodedQuery).toEqual({ searchQuery: 'my search' });
    setter({ searchQuery: 'yours' });
    expect(calledPushQuery(adapter, 0)).toEqual({
      q: 'yours',
    });
    rerender();
    const [decodedQuery2] = result.current;
    expect(decodedQuery2).toEqual({ searchQuery: 'yours' });
  });

  describe('default values', () => {
    it('replaces undefined with default value withDefault', () => {
      const { wrapper } = setupWrapper({});
      const { result, rerender } = renderHook(
        () => useQueryParams({ foo: withDefault(StringParam, 'boop') }),
        {
          wrapper,
        }
      );
      const [decodedQuery, setter] = result.current;

      expect(decodedQuery).toEqual({ foo: 'boop' });
      setter({ foo: undefined });
      rerender();
      const [decodedQuery2, setter2] = result.current;
      expect(decodedQuery2).toEqual({ foo: 'boop' });
      setter2({ foo: 'beep' });
      rerender();
      const [decodedQuery3] = result.current;
      expect(decodedQuery3).toEqual({ foo: 'beep' });
    });

    it('replaces undefined with default value', () => {
      const { wrapper } = setupWrapper({});
      const { result, rerender } = renderHook(
        // note it is still recommended to use withDefault() which gives better type inference
        () => useQueryParams({ foo: { ...StringParam, default: 'boop' } }),
        {
          wrapper,
        }
      );
      const [decodedQuery, setter] = result.current;

      expect(decodedQuery).toEqual({ foo: 'boop' });
      setter({ foo: null });
      rerender();
      const [decodedQuery2, setter2] = result.current;
      expect(decodedQuery2).toEqual({ foo: 'boop' });
      setter2({ foo: 'beep' });
      rerender();
      const [decodedQuery3] = result.current;
      expect(decodedQuery3).toEqual({ foo: 'beep' });
    });

    it('supports a changing default value', () => {
      const { wrapper } = setupWrapper({});
      const { result, rerender } = renderHook(
        ({ defaultValue }: { defaultValue: string }) =>
          // note it is still recommended to use withDefault() which gives better type inference
          useQueryParams({ foo: { ...StringParam, default: defaultValue } }),
        {
          wrapper,
          initialProps: {
            defaultValue: 'boop',
          },
        }
      );
      const [decodedQuery] = result.current;

      expect(decodedQuery).toEqual({ foo: 'boop' });
      rerender({ defaultValue: 'zing' });
      const [decodedQuery2] = result.current;
      expect(decodedQuery2).toEqual({ foo: 'zing' });
    });
  });

  describe('should call custom paramConfig.decode properly', () => {
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
      expect(decodeSpy).toHaveBeenCalledTimes(1);
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
      // twice per call since we useState inside the hook :(
      expect(decodeSpy).toHaveBeenCalledTimes(2);
      setter({ bar: '3' });
      rerender();
      expect(decodeSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('inherited params', () => {
    it('works with useQueryParams()', () => {
      const { wrapper } = setupWrapper(
        { x: '99', y: '123', z: '1' },
        {
          params: {
            x: NumberParam,
            z: BooleanParam,
          },
        }
      );
      const { result, rerender } = renderHook(() => useQueryParams(), {
        wrapper,
      });

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ x: 99, z: true });
      setter({ z: false });
      rerender();
      const [decodedValue2] = result.current;
      expect(decodedValue2).toEqual({ x: 99, z: false });
    });

    it('works with useQueryParams(["x", "z"])', () => {
      const paramConfig = {
        x: NumberParam,
        z: BooleanParam,
        a: StringParam,
      };
      const { wrapper } = setupWrapper(
        { x: '99', y: '123', z: '1' },
        {
          params: paramConfig,
        }
      );
      const { result, rerender } = renderHook(
        () => useQueryParams<Pick<typeof paramConfig, 'x' | 'z'>>(['x', 'z']),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ x: 99, z: true });
      setter({ z: false });
      rerender();
      const [decodedValue2] = result.current;
      expect(decodedValue2).toEqual({ x: 99, z: false });
    });

    it('does not auto include with useQueryParams({ y })', () => {
      const { wrapper } = setupWrapper(
        { x: '99', y: '123', z: '1' },
        {
          params: {
            x: NumberParam,
            z: BooleanParam,
          },
        }
      );
      const { result, rerender } = renderHook(
        () => useQueryParams({ y: StringParam }),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ y: '123' });
      setter({ y: 'X' });
      rerender();
      const [decodedValue2] = result.current;
      expect(decodedValue2).toEqual({ y: 'X' });
    });

    it('works when explicitly included with useQueryParams({ y })', () => {
      const { wrapper } = setupWrapper(
        { x: '99', y: '123', z: '1' },
        {
          params: {
            x: NumberParam,
            z: BooleanParam,
          },
        }
      );
      const { result, rerender } = renderHook(
        () =>
          useQueryParams<
            {
              y: typeof StringParam;
            },
            {
              x: typeof NumberParam;
              y: typeof StringParam;
              z: typeof BooleanParam;
            }
          >({ y: StringParam }, { includeKnownParams: true }),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ x: 99, y: '123', z: true });
      setter({ z: false, y: 'X' });
      rerender();
      const [decodedValue2] = result.current;
      expect(decodedValue2).toEqual({ x: 99, y: 'X', z: false });
    });

    it('works when explicitly included via string with useQueryParams({ y })', () => {
      const { wrapper } = setupWrapper(
        { x: '99', y: '123', z: '1' },
        {
          params: {
            x: NumberParam,
            z: BooleanParam,
          },
        }
      );
      const { result, rerender } = renderHook(
        () =>
          useQueryParams<
            {
              y: typeof StringParam;
              z: 'inherit';
            },
            {
              y: typeof StringParam;
              z: typeof BooleanParam;
            }
          >({ y: StringParam, z: 'inherit' }),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ y: '123', z: true });
      setter({ z: false, y: 'X' });
      rerender();
      const [decodedValue2] = result.current;
      expect(decodedValue2).toEqual({ y: 'X', z: false });
    });

    it('allows updating params that have been configured only in a provider', () => {
      const { wrapper, adapter } = setupWrapper(
        {
          known: 'foo',
          unknown: 'bar',
        },
        {
          params: {
            inherited: BooleanParam,
          },
        }
      );
      const { result } = renderHook(
        () => useQueryParams({ known: StringParam }),
        {
          wrapper,
        }
      );

      const [decodedValue, setter] = result.current;
      expect(decodedValue).toEqual({ known: 'foo' });
      setter({ unknown: 'zzz', nothing: 'xx', inherited: true } as any);
      expect(calledPushQuery(adapter, 0)).toEqual({
        known: 'foo',
        unknown: 'zzz',
        nothing: 'xx',
        inherited: '1',
      });
    });
  });

  it('works with includeAllParams', () => {
    const { wrapper, adapter } = setupWrapper(
      {
        known: 'foo',
        unknown: '99',
        inherited2: '5',
      },
      {
        params: {
          inherited: BooleanParam,
          inherited2: NumberParam,
        },
        includeAllParams: true,
      }
    );
    const { result, rerender } = renderHook(
      () => useQueryParams({ known: StringParam }),
      {
        wrapper,
      }
    );

    const [decodedQuery, setter] = result.current;
    expect(decodedQuery).toEqual({
      known: 'foo',
      unknown: '99',
      inherited2: 5,
    });
    setter({ unknown: 'zzz', inherited: true } as any);
    expect(calledPushQuery(adapter, 0)).toEqual({
      known: 'foo',
      unknown: 'zzz',
      inherited: '1',
      inherited2: '5',
    });

    rerender();
    const [decodedQuery2, setter2] = result.current;
    expect(decodedQuery2).toEqual({
      known: 'foo',
      unknown: 'zzz',
      inherited: true,
      inherited2: 5,
    });
    setter2({ nothing: 'A', unknown: 'ooo' } as any);
    rerender();
    const [decodedQuery3] = result.current;
    expect(decodedQuery3).toEqual({
      known: 'foo',
      unknown: 'ooo',
      inherited: true,
      inherited2: 5,
      nothing: 'A',
    });
  });

  it('works with includeAllParams on useQueryParams()', () => {
    const queryParamConfig = {
      inherited: BooleanParam,
      inherited2: NumberParam,
    };

    const { wrapper, adapter } = setupWrapper(
      {
        unknown: '99',
        inherited2: '5',
      },
      {
        params: queryParamConfig,
        includeAllParams: true,
      }
    );
    const { result, rerender } = renderHook(
      () => useQueryParams<typeof queryParamConfig>(),
      {
        wrapper,
      }
    );

    const [decodedQuery, setter] = result.current;
    expect(decodedQuery).toEqual({
      unknown: '99',
      inherited2: 5,
    });
    setter({ unknown: 'zzz', inherited: true } as any);
    expect(calledPushQuery(adapter, 0)).toEqual({
      unknown: 'zzz',
      inherited: '1',
      inherited2: '5',
    });

    rerender();
    const [decodedQuery2, setter2] = result.current;
    expect(decodedQuery2).toEqual({
      unknown: 'zzz',
      inherited: true,
      inherited2: 5,
    });
    setter2({ nothing: 'A', unknown: 'ooo' } as any);
    rerender();
    const [decodedQuery3] = result.current;
    expect(decodedQuery3).toEqual({
      unknown: 'ooo',
      inherited: true,
      inherited2: 5,
      nothing: 'A',
    });
  });
});
