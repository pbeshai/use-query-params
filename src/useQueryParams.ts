import * as React from 'react';
import {
  DecodedValueMap,
  EncodedQuery,
  encodeQueryParams,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { usePreviousIfShallowEqual, getSSRSafeSearchString } from './helpers';
import { useQueryParamContext } from './QueryParamProvider';
import { SetQuery, UrlUpdateType } from './types';
import updateUrlQuery from './updateUrlQuery';
import { sharedMemoizedQueryParser } from './memoizedQueryParser';
import shallowEqual from './shallowEqual';

type DecodedValueCacheEntry<E, D> = { decodedValue: D; encodedValue: E };
type DecodedValueCache<QPCMap extends QueryParamConfigMap> = {
  [P in keyof QPCMap]?: DecodedValueCacheEntry<
    string | (string | null)[] | null | undefined,
    ReturnType<QPCMap[P]['decode']>
  >;
};

/**
 * Given a query parameter configuration (mapping query param name to { encode, decode }),
 * return an object with the decoded values and a setter for updating them.
 */
export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const { history, location } = useQueryParamContext();
  const decodedValueCacheRef = React.useRef<DecodedValueCache<QPCMap>>({});

  // memoize paramConfigMap to make the API nicer for consumers.
  // otherwise we'd have to useQueryParams(useMemo(() => { foo: NumberParam }, []))
  paramConfigMap = usePreviousIfShallowEqual(paramConfigMap);

  // create a setter for updating multiple query params at once
  const setQuery = React.useCallback(
    (changes: Partial<DecodedValueMap<QPCMap>>, updateType?: UrlUpdateType) => {
      // encode as strings for the URL
      const encodedChanges: EncodedQuery = encodeQueryParams(
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

  // read in the raw query
  const parsedQuery = sharedMemoizedQueryParser(
    getSSRSafeSearchString(location)
  );

  // decode all the values if we have changes
  const decodedValues = React.useMemo(() => {
    const decodedValueCache = decodedValueCacheRef.current;

    // we are decoding since the parsed query changed or the param config map has changed.

    // recompute new values but only for those that changed
    const paramNames = Object.keys(paramConfigMap);
    const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
    for (const paramName of paramNames) {
      const paramConfig = paramConfigMap[paramName];
      const encodedValue = parsedQuery[paramName];
      let decodedValue;
      // re-use cached decoded value if we can, otherwise generate new
      const cacheEntry = decodedValueCache[paramName];
      if (
        cacheEntry != undefined &&
        shallowEqual(cacheEntry.encodedValue, encodedValue)
      ) {
        decodedValue = cacheEntry.decodedValue;
      } else {
        if (cacheEntry == null) {
          decodedValueCache[paramName as keyof QPCMap] = {} as any;
        }
        decodedValue = paramConfig.decode(encodedValue);
        (decodedValueCache[paramName] as any).encodedValue = encodedValue;
        (decodedValueCache[paramName] as any).decodedValue = decodedValue;
      }

      decodedValues[paramName as keyof QPCMap] = decodedValue;
    }

    return decodedValues;
  }, [paramConfigMap, parsedQuery]);

  // no longer Partial
  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
};

export default useQueryParams;
