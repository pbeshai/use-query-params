import { useMemo, useRef, useEffect, useCallback } from 'react';
import { QueryParamConfig, StringParam } from 'serialize-query-params';
import { memoParseParams } from './memoParseParams';
import { useMergedOptions } from './options';
import { useQueryParamContext } from './QueryParamProvider';
import { QueryParamOptions, UrlUpdateType } from './types';
import { createLocationWithChanges } from './updateUrlQuery';
import useQueryParams from './useQueryParams';

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
  const paramConfigMap = useMemo(() => ({ [name]: paramConfig }), [
    name,
    paramConfig,
  ]);
  const [query, setQuery] = useQueryParams(paramConfigMap, options);
  const decodedValue = query[name];
  const setValue = useCallback(
    (newValue: NewValueType<TypeToEncode>, updateType?: UrlUpdateType) => {
      if (typeof newValue === 'function') {
        return setQuery((latestValues) => {
          const newValueFromLatest = (newValue as Function)(latestValues[name]);
          return { [name]: newValueFromLatest };
        }, updateType);
      }
      return setQuery({ [name]: newValue } as any, updateType);
    },
    [name, setQuery]
  );

  return [decodedValue, setValue];
};
