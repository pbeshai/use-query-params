import { useMemo } from 'react';
import { QueryParamOptions, QueryParamOptionsWithRequired } from './types';

export function mergeOptions(
  parentOptions: QueryParamOptionsWithRequired,
  currOptions: QueryParamOptions | null | undefined
): QueryParamOptionsWithRequired {
  if (currOptions == null) {
    currOptions = {};
  }

  // merge parent (TODO: deep merge e.g. expanding "params")
  return { ...parentOptions, ...currOptions };
}

export function useMergedOptions(
  parentOptions: QueryParamOptionsWithRequired,
  currOptions: QueryParamOptions | null | undefined
): QueryParamOptionsWithRequired {
  return useMemo(() => {
    return mergeOptions(parentOptions, currOptions);
  }, [parentOptions, currOptions]);
}
