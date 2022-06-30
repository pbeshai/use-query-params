import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import {
  Router,
  Route,
  Switch,
  useHistory,
  useLocation,
  Link,
} from 'react-router-dom-5';
import { NumberParam, withDefault } from 'serialize-query-params';
import { describe, test } from 'vitest';
import { testSpec } from './shared';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
  QueryParamProvider,
  useQueryParam,
} from '../../index';
import { QueryParamOptions } from '../../options';

// inline this for convenience around build process...
/**
 * Query Param Adapter for react-router v5
 */
const ReactRouter5Adapter: QueryParamAdapterComponent = ({ children }) => {
  const location = useLocation();
  const history = useHistory();

  const adapter: QueryParamAdapter = {
    replace(location) {
      history.replace(location.search, location.state);
    },
    push(location) {
      history.push(location.search, location.state);
    },
    get location() {
      return location;
    },
  };

  return children(adapter);
};

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

afterEach(cleanup);
describe('routers/react-router-5', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
  testSpec(renderWithRouter);

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
});
