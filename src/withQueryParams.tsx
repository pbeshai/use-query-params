import * as React from 'react';
import { QueryParamConfigMap, DecodedValueMap } from 'serialize-query-params';
import useQueryParams from './useQueryParams';
import { SetQuery } from './types';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Diff<T, K> = Omit<T, keyof K>;

export interface InjectedQueryProps<QPCMap extends QueryParamConfigMap> {
  query: DecodedValueMap<QPCMap>;
  setQuery: SetQuery<QPCMap>;
}

/**
 * HOC to provide query parameters via props `query` and `setQuery`
 */
export function withQueryParams<
  QPCMap extends QueryParamConfigMap,
  P extends InjectedQueryProps<QPCMap>
>(paramConfigMap: QPCMap) {
  // function that query, setQuery, and other props
  return (WrappedComponent: React.ComponentType<P>) => {
    // return a FC that takes props excluding query and setQuery
    const Component: React.FC<Diff<P, InjectedQueryProps<QPCMap>>> = props => {
      const [query, setQuery] = useQueryParams(paramConfigMap);

      // see https://github.com/microsoft/TypeScript/issues/28938#issuecomment-450636046 for why `...props as P`
      return (
        <WrappedComponent query={query} setQuery={setQuery} {...(props as P)} />
      );
    };
    Component.displayName = `withQueryParams(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`;

    return Component;
  };
}

export default withQueryParams;
