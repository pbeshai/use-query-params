import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history-5';
import * as React from 'react';
import {
  useLocation,
  useNavigate,
  unstable_HistoryRouter,
} from 'react-router-dom-6';
import { describe } from 'vitest';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
  QueryParamProvider,
} from '../../index';
import { QueryParamOptions } from '../../options';
import { testSpec } from './shared';

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

// use this router so we can pass our own history to inspect
const HistoryRouter = unstable_HistoryRouter;

function renderWithRouter(
  ui: React.ReactNode,
  initialRoute: string,
  options?: QueryParamOptions
) {
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const results = render(
    <HistoryRouter history={history}>
      <QueryParamProvider Adapter={ReactRouterAdapter} options={options}>
        {ui}
      </QueryParamProvider>
    </HistoryRouter>
  );
  const rerender = (ui: React.ReactNode, newOptions = options) =>
    results.rerender(
      <HistoryRouter history={history}>
        <QueryParamProvider Adapter={ReactRouterAdapter} options={newOptions}>
          {ui}
        </QueryParamProvider>
      </HistoryRouter>
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
