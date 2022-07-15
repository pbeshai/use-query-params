/**
 * @jest-environment node
 */
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { StringParam, objectToSearchString } from 'serialize-query-params';
import { test } from 'vitest';
import QueryParamProvider from '../QueryParamProvider';
import { useQueryParam } from '../useQueryParam';
import { makeMockAdapter } from './helpers';

test('SSR initial query param', () => {
  const Component = () => {
    const [foo] = useQueryParam('foo', StringParam);

    return <div>{foo}</div>;
  };

  const query = { foo: 'bar' };
  const Adapter = makeMockAdapter({ search: objectToSearchString(query) });

  const result = renderToString(
    <QueryParamProvider adapter={Adapter}>
      <Component />
    </QueryParamProvider>
  );

  expect(result).toMatchInlineSnapshot(`"<div>bar</div>"`);
});
