import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history-5';
import * as React from 'react';
import {
  Router,
  Route,
  Switch,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom-6';
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
export const ReactRouterAdapter: QueryParamAdapterComponent = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adapter: QueryParamAdapter = {
    replace(location) {
      navigate(location, { replace: true, state: location.state });
    },
    push(location) {
      navigate(location, { replace: false, state: location.state });
    },
    get location() {
      return location;
    },
  };

  return children(adapter);
};

// copied from https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx#L32
// TODO: drop this if we rework tests to not require inspecting history object
export function TestMemoryRouter({
  children,
  history,
}: any): React.ReactElement {
  let [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  React.useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  );
}

function renderWithRouter(
  ui: React.ReactNode,
  initialRoute: string,
  options?: QueryParamOptions
) {
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const results = render(
    <TestMemoryRouter history={history}>
      <QueryParamProvider Adapter={ReactRouterAdapter} options={options}>
        {ui}
      </QueryParamProvider>
    </TestMemoryRouter>
  );
  const rerender = (ui: React.ReactNode, newOptions = options) =>
    results.rerender(
      <TestMemoryRouter history={history}>
        <QueryParamProvider Adapter={ReactRouterAdapter} options={newOptions}>
          {ui}
        </QueryParamProvider>
      </TestMemoryRouter>
    );
  return {
    ...results,
    rerender,
    history,
  };
}

afterEach(cleanup);
describe('routers/react-router-6', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
  testSpec(renderWithRouter);
});
