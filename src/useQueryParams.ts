import * as React from 'react';
import { parse as parseQueryString, ParsedQuery } from 'query-string';
import { useQueryParam } from './useQueryParam';
import updateUrlQuery from './updateUrlQuery';
import { QueryParamContext } from './QueryParamProvider';
import {
  UrlUpdateType,
  EncodedQueryWithNulls,
  DecodedValueMap,
  SetQuery,
  QueryParamConfigMap,
} from './types';

/**
 * Convert the values in query to strings via the encode functions configured
 * in paramConfigMap
 *
 * @param paramConfigMap Map from query name to { encode, decode } config
 * @param query Query updates mapping param name to decoded value
 */
export function encodeQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  query: Partial<DecodedValueMap<QPCMap>>
): EncodedQueryWithNulls {
  const encodedChanges: EncodedQueryWithNulls = {};
  const changingParamNames = Object.keys(query);
  for (const paramName of changingParamNames) {
    if (!paramConfigMap[paramName]) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Skipping encoding parameter ${paramName} since it was not configured.`
        );
      }
      continue;
    }
    encodedChanges[paramName] = paramConfigMap[paramName].encode(
      query[paramName]
    );
  }
  return encodedChanges;
}

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
    () =>
      (location.query as ParsedQuery) ||
      parseQueryString(location.search) ||
      {},
    [location.query, location.search]
  );

  // parse each parameter via usQueryParam
  const paramNames = Object.keys(paramConfigMap);
  const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
  for (const paramName of paramNames) {
    decodedValues[paramName] = useQueryParam(
      paramName,
      paramConfigMap[paramName],
      rawQuery
    )[0];
  }

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
