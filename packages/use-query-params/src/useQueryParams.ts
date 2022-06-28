import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DecodedValueMap,
  EncodedQuery,
  encodeQueryParams,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { DecodedParamCache, decodedParamCache } from './decodedParamCache';
import { memoParseParams } from './memoParseParams';
import { QueryParamOptions, useMergedOptions } from './options';
import { useQueryParamContext } from './QueryParamProvider';
import shallowEqual from './shallowEqual';
import { PartialLocation, SetQuery, UrlUpdateType } from './types';
type ChangesType<DecodedValueMapType> =
  | Partial<DecodedValueMapType>
  | ((latestValues: DecodedValueMapType) => Partial<DecodedValueMapType>);

/**
 * Helper to get the latest decoded values with smart caching.
 * Abstracted into its own function to allow re-use in a functional setter (#26)
 */
function getLatestDecodedValues<QPCMap extends QueryParamConfigMap>(
  parsedParams: EncodedQuery,
  paramConfigMap: QPCMap,
  decodedParamCache: DecodedParamCache,
  options: QueryParamOptions = {}
) {
  const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};

  // we have new encoded values, so let's get new decoded values.
  // recompute new values but only for those that changed
  const paramNames = Object.keys(paramConfigMap);
  for (const paramName of paramNames) {
    // do we have a new encoded value?
    const paramConfig = paramConfigMap[paramName];
    const encodedValue = parsedParams[paramName];

    // if we have a new encoded value, re-decode. otherwise reuse cache
    let decodedValue;
    if (decodedParamCache.has(paramName, encodedValue, paramConfig.decode)) {
      decodedValue = decodedParamCache.get(paramName);
    } else {
      decodedValue = paramConfig.decode(encodedValue);

      // check if we had a cached value for this encoded value but a different encoder
      // (sometimes people inline decode functions, e.g. withDefault...)
      // AND we had a different equals check than ===
      if (
        paramConfig.equals &&
        decodedParamCache.has(paramName, encodedValue)
      ) {
        const oldDecodedValue = decodedParamCache.get(paramName);
        if (paramConfig.equals(decodedValue, oldDecodedValue)) {
          decodedValue = oldDecodedValue;
        }
      }

      // do not cache undefined values
      if (decodedValue !== undefined) {
        decodedParamCache.set(
          paramName,
          encodedValue,
          decodedValue,
          paramConfig.decode
        );
      }
    }

    if (decodedValue === null && !options.keepNull) {
      decodedValue = undefined;
    } else if (decodedValue === '' && !options.keepEmptyString) {
      decodedValue = undefined;
    }

    decodedValues[paramName as keyof QPCMap] = decodedValue;
  }

  return decodedValues as DecodedValueMap<QPCMap>;
}

/**
 * Wrap get latest so we use the same exact object if the current
 * values are shallow equal to the previous.
 */
function makeStableGetLatestDecodedValues() {
  let prevDecodedValues: DecodedValueMap<any> | undefined;

  function stableGetLatest<QPCMap extends QueryParamConfigMap>(
    parsedParams: EncodedQuery,
    paramConfigMap: QPCMap,
    decodedParamCache: DecodedParamCache,
    options: QueryParamOptions
  ) {
    const decodedValues = getLatestDecodedValues(
      parsedParams,
      paramConfigMap,
      decodedParamCache,
      options
    );
    if (
      prevDecodedValues != null &&
      shallowEqual(prevDecodedValues, decodedValues)
    ) {
      return prevDecodedValues;
    }
    prevDecodedValues = decodedValues;
    return decodedValues;
  }

  return stableGetLatest;
}

/**
 * Given a query parameter configuration (mapping query param name to { encode, decode }),
 * return an object with the decoded values and a setter for updating them.
 */
export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  options?: QueryParamOptions
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const { adapter, options: contextOptions } = useQueryParamContext();
  const [stableGetLatest] = useState(makeStableGetLatestDecodedValues);
  const mergedOptions = useMergedOptions(contextOptions, options);

  // what is the current stringified value?
  const parsedParams = memoParseParams(
    mergedOptions.parseParams,
    adapter.location.search
  );

  // run decode on each key, collect
  const decodedValues = stableGetLatest(
    parsedParams,
    paramConfigMap,
    decodedParamCache,
    mergedOptions
  );

  // clear out unused values in cache
  // use string for relatively stable effect dependency
  const paramKeyString = Object.keys(paramConfigMap).join('\0');
  useEffect(() => {
    const paramNames = paramKeyString.split('\0');
    decodedParamCache.registerParams(paramNames);
    return () => {
      decodedParamCache.unregisterParams(paramNames);
    };
  }, [paramKeyString]);

  // create a setter for updating multiple query params at once
  // use a ref for callback dependencies so we don't generate a new one unnecessarily
  const callbackDependencies = {
    adapter,
    paramConfigMap,
    options: mergedOptions,
  } as const;
  const callbackDependenciesRef =
    useRef<typeof callbackDependencies>(callbackDependencies);
  if (callbackDependenciesRef.current == null) {
    callbackDependenciesRef.current = callbackDependencies;
  }
  useEffect(() => {
    callbackDependenciesRef.current = {
      adapter,
      paramConfigMap,
      options: mergedOptions,
    };
  }, [adapter, paramConfigMap, mergedOptions]);

  // create callback
  const setQuery = useMemo(() => {
    return (
      changes: ChangesType<DecodedValueMap<QPCMap>>,
      updateType?: UrlUpdateType
    ) => {
      // read from a ref so we don't generate new setters each time any change
      const { adapter, paramConfigMap, options } =
        callbackDependenciesRef.current!;
      const { parseParams, stringifyParams } = options;
      if (updateType == null) updateType = options.updateType;

      let encodedChanges;
      const currentLocation = adapter.location;
      const parsedParams = memoParseParams(parseParams, currentLocation.search);

      // functional updates here get the latest values
      if (typeof changes === 'function') {
        const latestValues = getLatestDecodedValues(
          parsedParams,
          paramConfigMap,
          decodedParamCache,
          options
        );
        encodedChanges = encodeQueryParams(
          paramConfigMap,
          (changes as Function)(latestValues)
        );
      } else {
        // simple update here
        encodedChanges = encodeQueryParams(paramConfigMap, changes);
      }

      // update the location and URL
      let newLocation: PartialLocation;
      if (updateType === 'push' || updateType === 'replace') {
        newLocation = {
          search: stringifyParams(encodedChanges),
          state: currentLocation.state,
        };
      } else {
        newLocation = {
          search: stringifyParams({ ...parsedParams, ...encodedChanges }),
          state: currentLocation.state,
        };
      }

      if (newLocation.search?.length && newLocation.search[0] !== '?') {
        (newLocation as any).search = `?${newLocation.search}`;
      }

      if (updateType?.startsWith('replace')) {
        adapter.replace(newLocation);
      } else {
        adapter.push(newLocation);
      }
    };
  }, []);

  return [decodedValues, setQuery];
};

export default useQueryParams;
