import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DecodedValueMap,
  EncodedQuery,
  encodeQueryParams,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { DecodedParamCache, decodedParamCache } from './decodedParamCache';
import { memoParseParams } from './memoParseParams';
import { useMergedOptions } from './options';
import { useQueryParamContext } from './QueryParamProvider';
import shallowEqual from './shallowEqual';
import { QueryParamOptions, SetQuery, UrlUpdateType } from './types';
import { createLocationWithChanges } from './updateUrlQuery';

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
  decodedParamCache: DecodedParamCache
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

    decodedValues[paramName as keyof QPCMap] = decodedValue;
  }

  return {
    decodedValues: decodedValues as DecodedValueMap<QPCMap>,
  };
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
  const mergedOptions = useMergedOptions(contextOptions, options);
  const { parseParams } = mergedOptions;

  // what is the current stringified value?
  const parsedParams = memoParseParams(
    parseParams,
    adapter.getCurrentLocation().search
  );

  // run decode on each key, collect
  const { decodedValues } = getLatestDecodedValues(
    parsedParams,
    paramConfigMap,
    decodedParamCache
  );

  // create a setter for updating multiple query params at once
  // use a ref for callback dependencies so we don't generate a new one unnecessarily
  const callbackDependencies = {
    adapter,
    paramConfigMap,
    parseParams,
  } as const;
  const callbackDependenciesRef = useRef<typeof callbackDependencies>(
    callbackDependencies
  );
  if (callbackDependenciesRef.current == null) {
    callbackDependenciesRef.current = callbackDependencies;
  }
  useEffect(() => {
    callbackDependenciesRef.current = {
      adapter,
      paramConfigMap,
      parseParams,
    };
  }, [adapter, paramConfigMap, parseParams]);

  // create callback
  const setQuery = useMemo(() => {
    return (
      changes: ChangesType<DecodedValueMap<QPCMap>>,
      updateType?: UrlUpdateType
    ) => {
      // read from a ref so we don't generate new setters each time any change
      const {
        adapter,
        paramConfigMap,
        parseParams,
      } = callbackDependenciesRef.current!;

      let encodedChanges;
      const currentLocation = adapter.getCurrentLocation();

      // functional updates here get the latest values
      if (typeof changes === 'function') {
        const parsedParams = memoParseParams(
          parseParams,
          currentLocation.search
        );
        const { decodedValues: latestValues } = getLatestDecodedValues(
          parsedParams,
          paramConfigMap,
          decodedParamCache
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
      const newLocation = createLocationWithChanges(
        encodedChanges,
        currentLocation,
        updateType
      );
      if (updateType?.startsWith('replace')) {
        adapter.replace(newLocation);
      } else {
        adapter.push(newLocation);
      }
    };
  }, []);

  // check if shallow equal to previous, and if so use previous
  // see: https://beta-reactjs-org-git-you-might-not-fbopensource.vercel.app/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  // for why we use state here...
  // not sure what's worse: doing this prev check and incurring two renders in the calling component
  // or returning a shallow equals decodedValues when nothing has changed.
  const [prevDecodedValues, setPrev] = useState(decodedValues);
  let decodedValuesToUse = decodedValues;
  if (shallowEqual(decodedValues, prevDecodedValues)) {
    decodedValuesToUse = prevDecodedValues;
  } else {
    setPrev(decodedValues);
  }

  // no longer Partial
  return [decodedValuesToUse, setQuery];
};

export default useQueryParams;
