import { QueryParamConfigMap, DecodedValueMap } from 'serialize-query-params';
import useQueryParams from './useQueryParams';
import { SetQuery } from './types';

export interface QueryRenderProps<QPCMap extends QueryParamConfigMap> {
  query: DecodedValueMap<QPCMap>;
  setQuery: SetQuery<QPCMap>;
}

export interface QueryParamsProps<QPCMap extends QueryParamConfigMap> {
  config: QPCMap;
  children: (renderProps: QueryRenderProps<QPCMap>) => JSX.Element;
}

export const QueryParams = <QPCMap extends QueryParamConfigMap>({
  config,
  children,
}: QueryParamsProps<QPCMap>) => {
  const [query, setQuery] = useQueryParams(config);
  return children({ query, setQuery });
};

export default QueryParams;
