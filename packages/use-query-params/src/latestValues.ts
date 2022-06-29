import {
  DecodedValueMap,
  EncodedQuery,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { DecodedParamCache } from './decodedParamCache';
import { QueryParamOptions } from './options';
import shallowEqual from './shallowEqual';

/**
 * Helper to get the latest decoded values with smart caching.
 * Abstracted into its own function to allow re-use in a functional setter (#26)
 */
export function getLatestDecodedValues<QPCMap extends QueryParamConfigMap>(
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
export function makeStableGetLatestDecodedValues() {
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
