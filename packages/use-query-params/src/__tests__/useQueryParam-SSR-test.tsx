/**
 * @jest-environment node
 */
import * as React from 'react';
import { useQueryParam } from '../useQueryParam';
import { renderToString } from 'react-dom/server';
import QueryParamProvider from '../QueryParamProvider';
import { makeMockLocation } from './helpers';

test('SSR initial query param', () => {
  const Component = () => {
    const [foo] = useQueryParam('foo');

    return <div>{foo}</div>;
  };

  const location = makeMockLocation({ foo: 'bar' });

  const result = renderToString(
    <QueryParamProvider location={location}>
      <Component />
    </QueryParamProvider>
  );

  expect(result).toMatchInlineSnapshot(`"<div>bar</div>"`);
});
