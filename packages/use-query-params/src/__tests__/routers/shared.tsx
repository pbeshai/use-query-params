import { render, screen, waitFor } from '@testing-library/react';
import * as qs from 'query-string';
import { parse } from 'query-string';
import * as React from 'react';
import {
  DateParam,
  decodeQueryParams,
  NumberParam,
  QueryParamConfig,
  StringParam,
  withDefault,
} from 'serialize-query-params';
import { describe, test, vi } from 'vitest';
import { QueryParamProvider, useQueryParam, useQueryParams } from '../../index';
import { QueryParamOptions } from '../../options';

// An example counter component to be tested
const QueryParamExample = ({
  options,
  paramType = NumberParam,
}: {
  options?: QueryParamOptions;
  paramType?: QueryParamConfig<any>;
}) => {
  let [x, setX] = useQueryParam('x', paramType, options);
  const isUndefined = x === undefined;
  const isNull = x === null;
  const isEmptyString = x === '';
  if (x == null) x = 0;

  return (
    <div>
      <h1>{`x is ${x}${
        isUndefined
          ? ' undefined'
          : isNull
          ? ' null'
          : isEmptyString
          ? '""'
          : ''
      }`}</h1>
      <button onClick={() => setX(x! + 1)}>Change</button>
    </div>
  );
};

export function testSpec(renderWithRouter: any) {
  describe('components', () => {
    test('query param behaviour example', async () => {
      const { queryByText, getByText } = renderWithRouter(
        <QueryParamExample />,
        '?x=3'
      );

      expect(queryByText(/x is 3/)).toBeTruthy();
      getByText(/Change/).click();
      expect(queryByText(/x is 4/)).toBeTruthy();
    });

    test('query param location example', async () => {
      const { getByText, history } = renderWithRouter(
        <QueryParamExample />,
        '?x=3'
      );
      getByText(/Change/).click();
      expect(
        decodeQueryParams({ x: NumberParam }, parse(history.location.search))
      ).toEqual({ x: 4 });
    });

    test('issue 46', async () => {
      const Issue46 = () => {
        const [a = 1, setA] = useQueryParam('a', NumberParam);
        const [b, setB] = React.useState(1);

        React.useEffect(() => {
          if (b % 2 === 0) {
            setA(b);
          }
        }, [b, setA]);

        return (
          <div>
            <h4>a: {a}</h4>
            <h4>b: {b}</h4>
            <button type="button" onClick={() => setB(b + 1)}>
              up
            </button>
          </div>
        );
      };

      const { getByText } = renderWithRouter(<Issue46 />, '');
      getByText('a: 1');
      getByText('b: 1');
      getByText(/up/).click();
      getByText('a: 1');
      getByText('b: 2');

      // wait for use effect
      await screen.findByText('a: 2');

      getByText(/up/).click();
      getByText('a: 2');
      getByText('b: 3');

      // wait for use effect
      await new Promise((resolve) => setTimeout(() => resolve(true), 0));
      getByText('a: 2');
      getByText('b: 3');

      getByText(/up/).click();
      getByText('a: 2');
      getByText('b: 4');

      // wait for use effect
      await screen.findByText('a: 4');
      getByText('b: 4');

      // wait for another tick for good measure
      await new Promise((resolve) => setTimeout(() => resolve(true), 0));
      getByText('a: 4');
      getByText('b: 4');
    });

    test('date withDefault', () => {
      // An example counter component to be tested
      const DateQueryParamExample = () => {
        const [x, setX] = useQueryParam(
          'x',
          withDefault(DateParam, new Date(2020, 0, 1))
        );

        return (
          <div>
            <h1>{`x is ${x.toISOString()}`}</h1>
            <button onClick={() => setX(new Date(2020, 5, 6))}>Change</button>
          </div>
        );
      };

      const { queryByText, getByText } = renderWithRouter(
        <DateQueryParamExample />,
        ''
      );

      expect(queryByText(/x is 2020-01-01/)).toBeTruthy();
      getByText(/Change/).click();
      expect(queryByText(/x is 2020-06-06/)).toBeTruthy();
    });

    test('error when no QueryParamProvider is used', async () => {
      // silence the react console.error call
      let errMock = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<QueryParamExample />)).toThrow(
        'useQueryParams must be used within a QueryParamProvider'
      );
      errMock.mockRestore();
    });

    test('#192 - not re-encoding paths', async () => {
      const { queryByText, getByText, history } = renderWithRouter(
        <QueryParamExample />,
        '/foo[0]?x=3'
      );

      expect(queryByText(/x is 3/)).toBeTruthy();
      getByText(/Change/).click();
      expect(queryByText(/x is 4/)).toBeTruthy();
      expect(history.location.search).toBe('?x=4');
      expect(history.location.pathname).toBe('/foo[0]');
    });

    describe('options', () => {
      it('updateType', () => {
        const { queryByText, getByText, history, rerender } = renderWithRouter(
          <QueryParamExample options={{ updateType: 'replace' }} />,
          '?x=3&y=z',
          { updateType: 'push' }
        );
        const replaceSpy = vi.spyOn(history, 'replace');
        const pushSpy = vi.spyOn(history, 'push');

        expect(queryByText(/x is 3/)).toBeTruthy();
        getByText(/Change/).click();
        expect(queryByText(/x is 4/)).toBeTruthy();
        expect(history.location.search).toBe('?x=4');
        expect(replaceSpy).toHaveBeenCalledTimes(1);
        expect(pushSpy).toHaveBeenCalledTimes(0);

        rerender(<QueryParamExample />, { updateType: 'push' });

        expect(queryByText(/x is 4/)).toBeTruthy();
        getByText(/Change/).click();
        expect(queryByText(/x is 5/)).toBeTruthy();
        expect(history.location.search).toBe('?x=5');
        expect(replaceSpy).toHaveBeenCalledTimes(1);
        expect(pushSpy).toHaveBeenCalledTimes(1);
      });

      it('parse/stringify with hash', () => {
        const TestComponent = () => {
          const [query, setQuery] = useQueryParams({
            f: NumberParam,
            g: StringParam,
            h: NumberParam,
          });

          return (
            <div>
              {JSON.stringify(query)}
              <button onClick={() => setQuery({ f: 2, g: 'b', h: 7 })}>
                Change
              </button>
            </div>
          );
        };

        const { queryByText, history, getByText } = renderWithRouter(
          <TestComponent />,
          '?store=0x1a8',
          {
            searchStringToObject: (searchString: string) => {
              const parsed = qs.parse(searchString);
              const { store } = parsed;
              let f, g, h;
              if (store) {
                f = store[2];
                g = store[3];
                h = store[4];
              }

              return {
                f,
                g,
                h,
              };
            },
            objectToSearchString: (encodedParams: any) => {
              const { f, g, h } = encodedParams;
              const store = `0x${f}${g}${h}`;

              return qs.stringify({ store });
            },
          }
        );

        expect(queryByText(/{"f":1,"g":"a","h":8}/)).toBeTruthy();
        expect(history.location.search).toBe('?store=0x1a8');
        getByText(/Change/).click();
        expect(queryByText(/{"f":2,"g":"b","h":7}/)).toBeTruthy();
        expect(history.location.search).toBe('?store=0x2b7');
      });

      it('removeDefaultsFromUrl', () => {
        const { queryByText, getByText, history, rerender } = renderWithRouter(
          <QueryParamExample
            options={{ removeDefaultsFromUrl: true }}
            paramType={withDefault(NumberParam, 3)}
          />,
          '?x=3'
        );
        expect(history.location.search).toBe('?x=3');
        const pushSpy = vi.spyOn(history, 'push');
        expect(queryByText(/x is 3/)).toBeTruthy();
        getByText(/Change/).click();
        expect(history.location.search).toBe('?x=4');
        expect(queryByText(/x is 4/)).toBeTruthy();
        expect(pushSpy).toHaveBeenCalledTimes(1);

        rerender(
          <QueryParamExample
            options={{ removeDefaultsFromUrl: true }}
            paramType={withDefault(NumberParam, 5)}
          />
        );

        expect(history.location.search).toBe('?x=4');
        expect(queryByText(/x is 4/)).toBeTruthy();
        getByText(/Change/).click();
        expect(history.location.search).toBe('');
        expect(queryByText(/x is 5/)).toBeTruthy();
        expect(pushSpy).toHaveBeenCalledTimes(2);
      });
    });

    it('multiple nested providers', () => {
      const TestComponent = () => {
        const [query, setQuery] = useQueryParams();

        return (
          <div>
            {JSON.stringify(query)}
            <button onClick={() => setQuery({ f: 2, g: 'b', h: 7 })}>
              Change
            </button>
          </div>
        );
      };
      const { queryByText, getByText } = renderWithRouter(
        <div>
          <QueryParamProvider
            options={{
              params: {
                h: NumberParam,
              },
            }}
          >
            <div>
              <TestComponent />
            </div>
          </QueryParamProvider>
        </div>,
        '?f=1&g=a&h=8',
        {
          searchStringToObject: qs.parse,
          objectToSearchString: qs.stringify,
          params: {
            f: NumberParam,
            g: StringParam,
          },
        }
      );

      expect(queryByText(/{"f":1,"g":"a","h":8}/)).toBeTruthy();
      getByText(/Change/).click();
      expect(queryByText(/{"f":2,"g":"b","h":7}/)).toBeTruthy();
    });

    it('multiple updates in same callback work (no batching) with useQueryParam', async () => {
      const TestComponent = () => {
        const [foo, setFoo] = useQueryParam('foo');
        const [bar, setBar] = useQueryParam('bar');
        const [baz, setBaz] = useQueryParam('baz');

        return (
          <div>
            {JSON.stringify({ foo, bar, baz })}
            <button
              onClick={() => {
                setFoo('foo2');
                setBar('bar2');
                setBaz('baz2');
              }}
            >
              Change
            </button>
          </div>
        );
      };
      const { queryByText, getByText } = renderWithRouter(
        <TestComponent />,
        '?foo=foo1&bar=bar1&baz=baz1',
        { enableBatching: false }
      );

      expect(
        queryByText(/{"foo":"foo1","bar":"bar1","baz":"baz1"}/)
      ).toBeTruthy();
      getByText(/Change/).click();
      await waitFor(() =>
        expect(
          queryByText(/{"foo":"foo2","bar":"bar2","baz":"baz2"}/)
        ).toBeTruthy()
      );
    });

    it('multiple updates in same callback work (batching) with useQueryParam', async () => {
      let numRenders = 0;
      const TestComponent = () => {
        const [foo, setFoo] = useQueryParam('foo');
        const [bar, setBar] = useQueryParam('bar');
        const [baz, setBaz] = useQueryParam('baz');

        numRenders += 1;

        return (
          <div>
            {JSON.stringify({ foo, bar, baz })}
            <button
              onClick={() => {
                setFoo('foo2');
                setBar('bar2');
                setBaz('baz2');
              }}
            >
              Change
            </button>
          </div>
        );
      };
      const { queryByText, getByText } = renderWithRouter(
        <TestComponent />,
        '?foo=foo1&bar=bar1&baz=baz1',
        { enableBatching: true }
      );

      expect(numRenders).toBe(1);
      expect(
        queryByText(/{"foo":"foo1","bar":"bar1","baz":"baz1"}/)
      ).toBeTruthy();
      getByText(/Change/).click();
      await waitFor(() =>
        expect(
          queryByText(/{"foo":"foo2","bar":"bar2","baz":"baz2"}/)
        ).toBeTruthy()
      );
      expect(numRenders).toBe(2);
    });

    it('multiple updates in same callback work (batching) with useQueryParams', async () => {
      let numRenders = 0;
      const TestComponent = () => {
        const [{ foo }, setFoo] = useQueryParams({ foo: StringParam });
        const [{ bar }, setBar] = useQueryParams({ bar: StringParam });
        const [{ baz }, setBaz] = useQueryParams({ baz: StringParam });

        numRenders += 1;
        return (
          <div>
            {JSON.stringify({ foo, bar, baz })}
            <button
              onClick={() => {
                setFoo({ foo: 'foo2' });
                setBar({ bar: 'bar2' });
                setBaz({ baz: 'baz2' });
              }}
            >
              Change
            </button>
          </div>
        );
      };
      const { queryByText, getByText } = renderWithRouter(
        <TestComponent />,
        '?foo=foo1&bar=bar1&baz=baz1',
        { enableBatching: true }
      );

      expect(
        queryByText(/{"foo":"foo1","bar":"bar1","baz":"baz1"}/)
      ).toBeTruthy();
      getByText(/Change/).click();
      await waitFor(() =>
        expect(
          queryByText(/{"foo":"foo2","bar":"bar2","baz":"baz2"}/)
        ).toBeTruthy()
      );
      expect(numRenders).toBe(2);
    });

    it('doesnt update when the search string is the same', async () => {
      let numRenders = 0;
      const TestComponent = () => {
        const [foo, setFoo] = useQueryParam('foo');

        numRenders += 1;
        return (
          <div>
            {JSON.stringify({ foo })}
            <button
              onClick={() => {
                setFoo('foo1');
              }}
            >
              Change
            </button>
          </div>
        );
      };
      const { queryByText, getByText } = renderWithRouter(
        <TestComponent />,
        '?foo=foo1'
      );

      expect(queryByText(/{"foo":"foo1"}/)).toBeTruthy();
      getByText(/Change/).click();
      await waitFor(() => expect(queryByText(/{"foo":"foo1"}/)).toBeTruthy());
      expect(numRenders).toBe(1);
    });
  });
}
