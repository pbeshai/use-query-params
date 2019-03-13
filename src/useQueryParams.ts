import * as React from 'react';
import { parse as parseQueryString, ParsedQuery } from 'query-string';
import { useQueryParam, QueryParamConfig } from './useQueryParam';
import updateUrlQuery from './updateUrlQuery';
import { QueryParamContext } from './QueryParamProvider';
import { UrlUpdateType } from './types';

interface QueryParamConfigMap {
  [paramName: string]: QueryParamConfig<any>;
}

type DecodedValueMap<QPCMap extends QueryParamConfigMap> = {
  [P in keyof QPCMap]: ReturnType<QPCMap[P]['decode']>
};

type SetQuery<QPCMap extends QueryParamConfigMap> = (
  changes: Partial<DecodedValueMap<QPCMap>>,
  updateType?: UrlUpdateType
) => void;

export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const { history, location } = React.useContext(QueryParamContext);

  // read in the raw query
  const rawQuery =
    (location.query as ParsedQuery) || parseQueryString(location.search) || {};

  // parse each parameter

  const paramNames = Object.keys(paramConfigMap);
  const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
  for (const paramName of paramNames) {
    decodedValues[paramName] = useQueryParam(
      paramName,
      paramConfigMap[paramName],
      rawQuery
    )[0];
  }

  const setQuery = React.useCallback(
    (changes: Partial<DecodedValueMap<QPCMap>>, updateType?: UrlUpdateType) => {
      updateUrlQuery(changes, location, history, updateType);
    },
    [location]
  );

  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
};

export default useQueryParams;
