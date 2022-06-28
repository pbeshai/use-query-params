import * as React from 'react';
import {
  mergeOptions,
  defaultOptions,
  QueryParamOptions,
  QueryParamOptionsWithRequired,
} from './options';
import { QueryParamAdapter, QueryParamAdapterComponent } from './types';

/**
 * Shape of the QueryParamContext, which the hooks consume to read and
 * update the URL state.
 */
type QueryParamContextValue = {
  adapter: QueryParamAdapter;
  options: QueryParamOptionsWithRequired;
};

const providerlessContextValue: QueryParamContextValue = {
  adapter: {} as QueryParamAdapter,
  options: defaultOptions,
};

export const QueryParamContext = React.createContext<QueryParamContextValue>(
  providerlessContextValue
);

export function useQueryParamContext() {
  const value = React.useContext(QueryParamContext);
  if (
    process.env.NODE_ENV !== 'production' &&
    (value === undefined || value === providerlessContextValue)
  ) {
    throw new Error('useQueryParams must be used within a QueryParamProvider');
  }

  return value;
}

/**
 * Props for the Provider component, used to hook the active routing
 * system into our controls.
 */

interface QueryParamProviderProps {
  /** Main app goes here */
  children: React.ReactNode;
  Adapter: QueryParamAdapterComponent;
  options?: QueryParamOptions;
}

function QueryParamProviderInner({
  children,
  adapter,
  options,
}: {
  children: React.ReactNode;
  adapter?: QueryParamAdapter | undefined;
  options?: QueryParamOptions;
}) {
  // allow merging in parent options
  const { adapter: parentAdapter, options: parentOptions } =
    React.useContext(QueryParamContext);

  const value = React.useMemo(() => {
    return {
      adapter: adapter ?? parentAdapter,
      options: mergeOptions(
        parentOptions,
        options
      ) as QueryParamOptionsWithRequired,
    };
  }, [adapter, options, parentAdapter, parentOptions]);

  return (
    <QueryParamContext.Provider value={value}>
      {children}
    </QueryParamContext.Provider>
  );
}

/**
 * Context provider for query params to have access to the
 * active routing system, enabling updates to the URL.
 */
export function QueryParamProvider({
  children,
  Adapter,
  options,
}: QueryParamProviderProps) {
  return Adapter ? (
    <Adapter>
      {(adapter) => (
        <QueryParamProviderInner adapter={adapter} options={options}>
          {children}
        </QueryParamProviderInner>
      )}
    </Adapter>
  ) : (
    <QueryParamProviderInner options={options}>
      {children}
    </QueryParamProviderInner>
  );
}

export default QueryParamProvider;
