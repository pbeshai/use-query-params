import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { describe } from 'vitest';
import {
  PartialLocation,
  QueryParamAdapter,
  QueryParamAdapterComponent,
  QueryParamProvider,
} from '../../index';
import { QueryParamOptions } from '../../options';
import { testSpec } from './shared';

const createTestHistory = (initialRoute: string = '') => {
  const url = new URL(
    `http://localhost/${
      initialRoute.startsWith('/') ? initialRoute.slice(1) : initialRoute
    }`
  );
  const initialLocation = {
    search: url.search,
    state: {},
    pathname: url.pathname ?? (url as any).path[0],
  };

  let location: PartialLocation = initialLocation;
  const history = {
    replace(newLocation: PartialLocation) {
      location = { ...location, ...newLocation };
      this.onChange(location);
    },
    push(newLocation: PartialLocation) {
      location = { ...location, ...newLocation };
      this.onChange(location);
    },
    get location() {
      return location;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onChange: (newLocation: PartialLocation) => {},
  };

  return history;
};

type TestHistory = ReturnType<typeof createTestHistory>;

const TestRouterContext = React.createContext<TestHistory>(createTestHistory());

const TestRouter = ({
  history,
  children,
}: {
  history: TestHistory;
  children: React.ReactNode;
}) => {
  return (
    <TestRouterContext.Provider value={history}>
      {children}
    </TestRouterContext.Provider>
  );
};

/**
 * Query Param Adapter for mocked router
 */
const TestAdapter: QueryParamAdapterComponent = ({ children }) => {
  const history = React.useContext(TestRouterContext);
  // need a use state here to force a re-render
  const [, setLocation] = React.useState<PartialLocation>(history.location);
  React.useLayoutEffect(() => {
    history.onChange = setLocation;
  }, [history]);

  const adapter: QueryParamAdapter = {
    replace(newLocation) {
      history.replace(newLocation);
    },
    push(newLocation) {
      history.push(newLocation);
    },

    // note this always reads the latest in history to fix #233
    get location() {
      return history.location;
    },
  };
  return children(adapter);
};

function renderTest(
  ui: React.ReactNode,
  initialRoute: string,
  options?: QueryParamOptions
): any & { history: any } {
  const history = createTestHistory(initialRoute);
  const results = render(
    <TestRouter history={history}>
      <QueryParamProvider adapter={TestAdapter} options={options}>
        {ui}
      </QueryParamProvider>
    </TestRouter>
  );
  const rerender = (ui: React.ReactNode, newOptions = options) =>
    results.rerender(
      <TestRouter history={history}>
        <QueryParamProvider adapter={TestAdapter} options={newOptions}>
          {ui}
        </QueryParamProvider>
      </TestRouter>
    );
  return {
    ...results,
    rerender,
    history,
  } as any;
}

afterEach(cleanup);
describe('routers/mocked', () => {
  testSpec(renderTest);
});
