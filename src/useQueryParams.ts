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

  // ref with current version history object
  const refHistory = React.useRef<typeof history>(history);
  React.useEffect(
    () => {
      refHistory.current = history;
    },
    [history]
  );

  // ref with current version location object
  const refLocation = React.useRef<typeof location>(location);
  React.useEffect(
    () => {
      refLocation.current = location;
    },
    [location]
  );

  // read in the raw query
  const rawQuery = React.useMemo(
    () => parseQueryString(location.search) || {},
    [location.search]
  );

  // parse each parameter via useQueryParam
  // we reuse the logic to not recreate objects
  const paramNames = Object.keys(paramConfigMap);
  const paramValues = paramNames.map(
    paramName =>
      useQueryParam(paramName, paramConfigMap[paramName], rawQuery)[0]
  );

  // we use a memo here to prevent recreating the containing decodedValues object
  // which would break === comparisons even if no values changed.
  const decodedValues = React.useMemo(() => {
    // iterate over the decoded values and build an object
    const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
    for (let i = 0; i < paramNames.length; ++i) {
      decodedValues[paramNames[i]] = paramValues[i];
    }

    return decodedValues;
  }, paramValues);

  // create a setter for updating multiple query params at once
  const setQuery = React.useCallback(
    (changes: Partial<DecodedValueMap<QPCMap>>, updateType?: UrlUpdateType) => {
      // encode as strings for the URL
      const encodedChanges: EncodedQueryWithNulls = encodeQueryParams(
        paramConfigMap,
        changes
      );

      // update the URL
      updateUrlQuery(encodedChanges, refLocation.current, refHistory.current, updateType);
    },
    []
  );

  // no longer Partial
  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
};

export default useQueryParams;
