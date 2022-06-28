import { cleanup, render, screen } from '@testing-library/react';
import * as qs from 'query-string';
import { createMemoryHistory } from 'history';
import { parse } from 'query-string';
import * as React from 'react';
import { Router, Switch } from 'react-router';
import { Link, Route } from 'react-router-dom';
import {
  DateParam,
  decodeQueryParams,
  QueryParamConfig,
  StringParam,
  withDefault,
} from 'serialize-query-params';
import { describe, test, vi } from 'vitest';
import { ReactRouter5Adapter } from '../adapters/react-router-5';
import { NumberParam, QueryParamProvider, useQueryParam } from '../index';
import { QueryParamOptions } from '../options';

function renderWithRouter(
  ui: React.ReactNode,
  initialRoute: string,
  options?: QueryParamOptions
) {
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const results = render(
    <Router history={history}>
      <QueryParamProvider Adapter={ReactRouter5Adapter} options={options}>
        {ui}
      </QueryParamProvider>
    </Router>
  );
  const rerender = (ui: React.ReactNode, newOptions = options) =>
    results.rerender(
      <Router history={history}>
        <QueryParamProvider Adapter={ReactRouter5Adapter} options={newOptions}>
          {ui}
        </QueryParamProvider>
      </Router>
    );
  return {
    ...results,
    rerender,
    history,
  };
}

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

afterEach(cleanup);
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

  // #95
  test('useEffect clobber example', async () => {
    const App = () => {
      return (
        <div>
          <Switch>
            <Route path="/second-page">
              <SecondPage />
            </Route>
            <Route path="/">
              <FirstPage />
            </Route>
          </Switch>
        </div>
      );
    };

    const FirstPage = () => {
      return (
        <div>
          <div>click-dummy</div>
          <p>This is the first page.</p>
          <Link to="/second-page">link-to-second</Link>
        </div>
      );
    };

    const SecondPage = () => {
      const [paramFromUrl, setParam] = useQueryParam(
        'param',
        withDefault(NumberParam, undefined)
      );

      React.useEffect(() => {
        // set the param as the default on mount.
        if (paramFromUrl === undefined) {
          setParam(10);
        }
      }, [paramFromUrl, setParam]);

      const param = paramFromUrl === undefined ? 10 : paramFromUrl;

      return (
        <div>
          <div>click-dummy</div>
          <p>This is the second page.</p>
          <p>Param is {param}</p>
          <Link to="/">link-to-first</Link>
          <p>
            <button onClick={() => setParam(100)}>Set param to 100</button>
          </p>
        </div>
      );
    };

    const { getByText } = renderWithRouter(<App />, '');
    getByText(/link-to-second/).click(); // head to second page
    getByText(/link-to-first/); // verify we are on second page

    // wait for next tick (dont know how to make it do this otherwise...)
    // (await screen.findByText('click-dummy')).click();
    await new Promise((resolve) => setTimeout(() => resolve(true), 0));
    // verify we are still on second page
    getByText(/link-to-first/);
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
    const history = createMemoryHistory({ initialEntries: ['?x=3'] });

    // silence the react console.error call
    let errMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Router history={history}>
          <QueryParamExample />
        </Router>
      )
    ).toThrow('useQueryParams must be used within a QueryParamProvider');
    errMock.mockRestore();
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

    it('keepNull', () => {
      const { queryByText, rerender } = renderWithRouter(
        <QueryParamExample options={{ keepNull: true }} />,
        '?x',
        {
          parseParams: qs.parse,
          stringifyParams: qs.stringify,
        }
      );

      expect(queryByText(/x is 0 null/)).toBeTruthy();

      rerender(<QueryParamExample options={{ keepNull: false }} />);
      expect(queryByText(/x is 0 undefined/)).toBeTruthy();

      rerender(<QueryParamExample />);
      expect(queryByText(/x is 0 undefined/)).toBeTruthy();

      rerender(<QueryParamExample />, { keepNull: true });
      expect(queryByText(/x is 0 null/)).toBeTruthy();
    });

    it('keepEmptyString', () => {
      const { queryByText, rerender } = renderWithRouter(
        <QueryParamExample
          options={{ keepEmptyString: true }}
          paramType={StringParam}
        />,
        '?x=',
        {
          parseParams: qs.parse,
          stringifyParams: qs.stringify,
        }
      );

      expect(queryByText(/x is ""/)).toBeTruthy();

      rerender(
        <QueryParamExample
          paramType={StringParam}
          options={{ keepEmptyString: false }}
        />
      );
      expect(queryByText(/x is 0 undefined/)).toBeTruthy();

      rerender(<QueryParamExample paramType={StringParam} />);
      expect(queryByText(/x is 0 undefined/)).toBeTruthy();

      rerender(<QueryParamExample paramType={StringParam} />, {
        keepEmptyString: true,
      });
      expect(queryByText(/x is ""/)).toBeTruthy();
    });
  });
});
