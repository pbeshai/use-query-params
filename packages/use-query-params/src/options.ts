import { useMemo } from 'react';
import { EncodedQuery } from 'serialize-query-params';
import { parseParams } from './parseParams';
import { stringifyParams } from './stringifyParams';
import { UrlUpdateType } from './types';

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

export const defaultOptions: QueryParamOptionsWithRequired = {
  parseParams: parseParams,
  stringifyParams: stringifyParams,
  updateType: 'pushIn',
  keepNull: false,
  keepEmptyString: false,
};

export interface QueryParamOptions {
  parseParams?: (searchString: string) => EncodedQuery;
  stringifyParams?: (encodedParams: EncodedQuery) => string;
  updateType?: UrlUpdateType;
  keepNull?: boolean;
  keepEmptyString?: boolean;
}

type RequiredOptions = 'parseParams' | 'stringifyParams';
export type QueryParamOptionsWithRequired = Required<
  Pick<QueryParamOptions, RequiredOptions>
> &
  Omit<QueryParamOptions, RequiredOptions>;
