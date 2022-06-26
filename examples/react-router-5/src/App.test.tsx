import * as React from "react";
import { render, cleanup } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import { Route } from "react-router-dom";
import { parse } from "query-string";
import { decodeQueryParams } from "serialize-query-params";

import {
  useQueryParam,
  NumberParam,
  QueryParamProvider,
} from "use-query-params";

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
  const [x = 0, setX] = useQueryParam("x", NumberParam);
  return (
    <div>
      <h1>{`x is ${x}`}</h1>
      <button onClick={() => setX(x + 1)}>Change</button>
    </div>
  );
};

afterEach(cleanup);

test("query param behaviour example", async () => {
  const { queryByText, getByText } = renderWithRouter(
    <QueryParamExample />,
    "?x=3"
  );

  expect(queryByText(/x is 3/)).toBeTruthy();
  getByText(/Change/).click();
  expect(queryByText(/x is 4/)).toBeTruthy();
});

test("query param location example", async () => {
  const { getByText, history } = renderWithRouter(
    <QueryParamExample />,
    "?x=3"
  );
  getByText(/Change/).click();
  expect(
    decodeQueryParams({ x: NumberParam }, parse(history.location.search))
  ).toEqual({ x: 4 });
});
