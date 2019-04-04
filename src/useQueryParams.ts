import * as React from 'react';
import {
  parse as parseQueryString,
  encodeQueryParams,
  EncodedQueryWithNulls,
  DecodedValueMap,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { useQueryParam } from './useQueryParam';
import updateUrlQuery from './updateUrlQuery';
import { QueryParamContext } from './QueryParamProvider';
import { UrlUpdateType, SetQuery } from './types';

/**
 * Given a query parameter configuration (mapping query param name to { encode, decode }),
 * return an object with the decoded values and a setter for updating them.
 */
export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const { history, location } = React.useContext(QueryParamContext);

  // read in the raw query
  const rawQuery = React.useMemo(
    () => parseQueryString(location.search) || {},
    [location.search]
  );

  // parse each parameter via usQueryParam
  const paramNames = Object.keys(paramConfigMap);

  const paramValues = paramNames.map((paramName) => useQueryParam(
    paramName,
    paramConfigMap[paramName],
    rawQuery
  )[0]);

  const decodedValues = React.useMemo(() => paramNames.reduce<Partial<DecodedValueMap<QPCMap>>>((result, paramName, i) => {
    result[paramName] = paramValues[i];
    return result;
  }, {}), paramValues)

  // create a setter for updating multiple query params at once
  const setQuery = React.useCallback(
    (changes: Partial<DecodedValueMap<QPCMap>>, updateType?: UrlUpdateType) => {
      // encode as strings for the URL
      const encodedChanges: EncodedQueryWithNulls = encodeQueryParams(
        paramConfigMap,
        changes
      );

      // update the URL
      updateUrlQuery(encodedChanges, location, history, updateType);
    },
    [location]
  );

  // no longer Partial
  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
};

export default useQueryParams;
