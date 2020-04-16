import * as React from 'react';
import { parse as parseQueryString } from 'query-string';
import {
  encodeQueryParams,
  EncodedQueryWithNulls,
  DecodedValueMap,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { useQueryParam } from './useQueryParam';
import updateUrlQuery from './updateUrlQuery';
import { QueryParamContext } from './QueryParamProvider';
import { UrlUpdateType, SetQuery } from './types';

// from https://usehooks.com/usePrevious/
function usePrevious<T>(value: T) {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// from https://github.com/lodash/lodash/issues/2340#issuecomment-360325395
function isShallowEqual<T extends object>(objA: T, objB: T) {
  for (var key in objA)
    if (!(key in objB) || objA[key] !== objB[key]) return false;

  for (var key in objB)
    if (!(key in objA) || objA[key] !== objB[key]) return false;

  return true;
}

/**
 * Given a query parameter configuration (mapping query param name to { encode, decode }),
 * return an object with the decoded values and a setter for updating them.
 */
export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const { history, location } = React.useContext(QueryParamContext);
  const locationIsObject = typeof location === 'object';

  // memoize paramConfigMap to make the API nicer for consumers.
  // otherwise we'd have to useQueryParams(useMemo(() => { foo: NumberParam }, []))
  const prevParamConfigMap = usePrevious(paramConfigMap);
  const hasNewParamConfig = isShallowEqual(prevParamConfigMap, paramConfigMap);
  // prettier-ignore
  const memoParamConfigMap = React.useMemo(() => paramConfigMap, [ // eslint-disable-line react-hooks/exhaustive-deps
    hasNewParamConfig,
  ]);
  paramConfigMap = memoParamConfigMap;

  // ref with current version history object (see #46)
  const refHistory = React.useRef<typeof history>(history);
  React.useEffect(() => {
    refHistory.current = history;
  }, [history]);

  // ref with current version location object (see #46)
  const refLocation = React.useRef<typeof location>(location);
  React.useEffect(() => {
    refLocation.current = location;
  }, [location]);

  const search = locationIsObject ? location.search : '';

  // read in the raw query
  const rawQuery = React.useMemo(() => parseQueryString(search) || {}, [
    search,
  ]);

  // parse each parameter via useQueryParam
  // we reuse the logic to not recreate objects
  const paramNames = Object.keys(paramConfigMap);
  const paramValues = paramNames.map(
    (paramName) =>
      useQueryParam(paramName, paramConfigMap[paramName], rawQuery)[0]
  );

  // we use a memo here to prevent recreating the containing decodedValues object
  // which would break === comparisons even if no values changed.
  const decodedValues = React.useMemo(() => {
    // iterate over the decoded values and build an object
    const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
    for (let i = 0; i < paramNames.length; ++i) {
      decodedValues[paramNames[i] as keyof QPCMap] = paramValues[i];
    }

    return decodedValues;
  }, paramValues); // eslint-disable-line react-hooks/exhaustive-deps

  // create a setter for updating multiple query params at once
  const setQuery = React.useCallback(
    (changes: Partial<DecodedValueMap<QPCMap>>, updateType?: UrlUpdateType) => {
      // encode as strings for the URL
      const encodedChanges: EncodedQueryWithNulls = encodeQueryParams(
        paramConfigMap,
        changes
      );

      // update the URL
      updateUrlQuery(
        encodedChanges,
        refHistory.current.location || refLocation.current, // see #46
        refHistory.current,
        updateType
      );
    },
    [paramConfigMap]
  );

  // no longer Partial
  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
};

export default useQueryParams;
