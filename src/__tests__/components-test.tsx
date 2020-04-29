import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { parse } from 'query-string';
import * as React from 'react';
import { Router, Switch } from 'react-router';
import { Link, Route } from 'react-router-dom';
import { decodeQueryParams, withDefault } from 'serialize-query-params';
import { NumberParam, QueryParamProvider, useQueryParam } from '../index';

function renderWithRouter(ui: React.ReactNode, initialRoute: string) {
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  return {
    ...render(
      <Router history={history}>
        <QueryParamProvider ReactRouterRoute={Route}>{ui}</QueryParamProvider>
      </Router>
    ),
    history,
  };
}

// An example counter component to be tested
const QueryParamExample = () => {
  const [x = 0, setX] = useQueryParam('x', NumberParam);
  return (
    <div>
      <h1>{`x is ${x}`}</h1>
      <button onClick={() => setX(x + 1)}>Change</button>
    </div>
  );
};

afterEach(cleanup);

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
  await new Promise((resolve) => setTimeout(() => resolve(), 0));
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
  await new Promise((resolve) => setTimeout(() => resolve(), 0));
  getByText('a: 2');
  getByText('b: 3');

  getByText(/up/).click();
  getByText('a: 2');
  getByText('b: 4');

  // wait for use effect
  await screen.findByText('a: 4');
  getByText('b: 4');

  // wait for another tick for good measure
  await new Promise((resolve) => setTimeout(() => resolve(), 0));
  getByText('a: 4');
  getByText('b: 4');
});
