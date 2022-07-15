import * as React from 'react';
import { cleanup, render } from '@testing-library/react';
import { describe, it } from 'vitest';
import {
  QueryParamProvider,
  useQueryParamContext,
} from '../QueryParamProvider';
import { QueryParamAdapter } from '../types';
import { makeMockAdapter } from './helpers';

describe('QueryParamProvider', () => {
  afterEach(cleanup);

  it('adapter comes through', () => {
    const Adapter = makeMockAdapter({ search: '?foo=99' });
    const adapter = (Adapter as any).adapter as QueryParamAdapter;

    let innerAdapter: any;
    const TestComponent = () => {
      const { adapter } = useQueryParamContext();
      innerAdapter = adapter;
      return <div>consumed</div>;
    };

    render(
      <QueryParamProvider adapter={Adapter}>
        <TestComponent />
      </QueryParamProvider>
    );

    expect(innerAdapter).toBe(adapter);
  });
});
