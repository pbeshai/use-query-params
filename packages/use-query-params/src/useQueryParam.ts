import { useMemo, useRef, useEffect } from 'react';
import { QueryParamConfig, StringParam } from 'serialize-query-params';
import { memoParseParams } from './memoParseParams';
import { useMergedOptions } from './options';
import { useQueryParamContext } from './QueryParamProvider';
import { QueryParamOptions, UrlUpdateType } from './types';
import { createLocationWithChanges } from './updateUrlQuery';

type NewValueType<D> = D | ((latestValue: D) => D);

/**
 * Given a query param name and query parameter configuration ({ encode, decode })
 * return the decoded value and a setter for updating it.
 *
 * The setter takes two arguments (newValue, updateType) where updateType
 * is one of 'replace' | 'replaceIn' | 'push' | 'pushIn', defaulting to
 * 'pushIn'.
 *
 * You may optionally pass in a rawQuery object, otherwise the query is derived
 * from the location available in the context.
 *
 */
export const useQueryParam = <TypeToEncode, TypeFromDecode = TypeToEncode>(
  name: string,
  paramConfig: QueryParamConfig<
    TypeToEncode,
    TypeFromDecode
  > = StringParam as QueryParamConfig<any>,
  options?: QueryParamOptions
): [
  TypeFromDecode,
  (newValue: NewValueType<TypeToEncode>, updateType?: UrlUpdateType) => void
] => {
  const { adapter, options: contextOptions } = useQueryParamContext();
  const mergedOptions = useMergedOptions(contextOptions, options);
  const { parseParams } = mergedOptions;

  // what is the current stringified value?
  const parsedParams = memoParseParams(
    parseParams,
    adapter.getCurrentLocation().search
  );
  const stringifiedValue = parsedParams[name];

  // decode the stringified value, caching the result
  const decodeParam = paramConfig.decode;
  const decodedValue = useMemo(() => decodeParam(stringifiedValue), [
    decodeParam,
    stringifiedValue,
  ]);

  // use a ref for callback dependencies so we don't generate a new one unnecessarily
  const callbackDependenciesRef = useRef<{
    adapter: typeof adapter;
    name: typeof name;
    paramConfig: typeof paramConfig;
    parseParams: typeof parseParams;
  }>();
  if (callbackDependenciesRef.current == null) {
    callbackDependenciesRef.current = {
      adapter,
      name,
      paramConfig,
      parseParams,
    };
  }
  useEffect(() => {
    callbackDependenciesRef.current = {
      adapter,
      name,
      paramConfig,
      parseParams,
    };
  }, [adapter, name, paramConfig, parseParams]);

  // create callback
  const setValue = useMemo(() => {
    return (
      newValue: NewValueType<TypeToEncode>,
      updateType?: UrlUpdateType
    ) => {
      // read from a ref so we don't generate new setters each time any change
      const {
        adapter,
        name,
        paramConfig,
        parseParams,
      } = callbackDependenciesRef.current!;

      let encodedValue;
      const currentLocation = adapter.getCurrentLocation();

      // functional updates here get the latest values
      if (typeof newValue === 'function') {
        const parsedParams = memoParseParams(
          parseParams,
          currentLocation.search
        );
        const stringifiedValue = parsedParams[name];
        const latestDecodedValue = paramConfig.decode(stringifiedValue);

        encodedValue = paramConfig.encode(
          (newValue as Function)(latestDecodedValue)
        );
      } else {
        // simple update here
        encodedValue = paramConfig.encode(newValue);
      }

      // update the location and URL
      const changes = { [name]: encodedValue };
      const newLocation = createLocationWithChanges(
        changes,
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

  return [decodedValue, setValue];
};
