import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { unstable_HistoryRouter } from 'react-router-dom';
import { describe, afterEach } from 'vitest';
import { QueryParamProvider, QueryParamOptions } from 'use-query-params/src';
import { testSpec } from 'use-query-params/src/__tests__/routers/shared';
import { ReactRouter6Adapter } from '..';

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
      <QueryParamProvider adapter={ReactRouter6Adapter} options={options}>
        {ui}
      </QueryParamProvider>
    </HistoryRouter>
  );
  const rerender = (ui: React.ReactNode, newOptions = options) =>
    results.rerender(
      <HistoryRouter history={history}>
        <QueryParamProvider adapter={ReactRouter6Adapter} options={newOptions}>
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
  testSpec(renderWithRouter);
});
