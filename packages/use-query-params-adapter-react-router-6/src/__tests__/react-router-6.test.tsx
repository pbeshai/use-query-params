import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryParamOptions, QueryParamProvider } from 'use-query-params/src';
import { testSpec } from 'use-query-params/src/__tests__/routers/shared';
import { afterEach, describe, vi } from 'vitest';
import { ReactRouter6Adapter } from '..';

function renderWithRouter(
  ui: React.ReactNode,
  initialRoute: string,
  options?: QueryParamOptions
) {
  // note this set up is a bit weird due to historical reasons where
  // we originally relied on a history object for a router to
  // determine push/replace. this is less the focus of newer react
  // router versions, but this adapter approach works.
  let entries: any[] = [initialRoute];
  const router = createMemoryRouter(
    [
      {
        path: '/:page?',
        element: (
          <QueryParamProvider adapter={ReactRouter6Adapter} options={options}>
            {ui}
          </QueryParamProvider>
        ),
      },
    ],
    { initialEntries: entries }
  );
  let history = {
    router,
    get location() {
      return this.router.state.location;
    },
    replace: vi.fn(),
    push: vi.fn(),
  };

  // keep track of updates to help tests inspect push/replace/rerender
  router.subscribe(function (state) {
    entries.push(state.location);
    if (state.historyAction === 'REPLACE') {
      history.replace(state.location);
    } else if (state.historyAction === 'PUSH') {
      history.push(state.location);
    }
  });

  const results = render(<RouterProvider router={router} />);
  const rerender = (ui: React.ReactNode, newOptions = options) => {
    const newRouter = createMemoryRouter(
      [
        {
          path: '/:page?',
          element: (
            <QueryParamProvider
              adapter={ReactRouter6Adapter}
              options={newOptions}
            >
              {ui}
            </QueryParamProvider>
          ),
        },
      ],
      { initialEntries: entries }
    );
    history.router = newRouter;

    // keep track of updates to help tests inspect push/replace/rerender
    newRouter.subscribe(function (state) {
      entries.push(state.location);
      if (state.historyAction === 'REPLACE') {
        history.replace(state.location);
      } else if (state.historyAction === 'PUSH') {
        history.push(state.location);
      }
    });

    return results.rerender(<RouterProvider router={newRouter} />);
  };
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
