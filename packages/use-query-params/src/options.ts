import { EncodedQuery, QueryParamConfigMap } from 'serialize-query-params';
import { parseParams } from './parseParams';
import { stringifyParams } from './stringifyParams';
import { UrlUpdateType } from './types';

export const defaultOptions: QueryParamOptionsWithRequired = {
  parseParams: parseParams,
  stringifyParams: stringifyParams,
  updateType: 'pushIn',
  includeKnownParams: undefined,
  includeAllParams: false,
  removeDefaultsFromUrl: false,
  enableBatching: false,
};

export interface QueryParamOptions {
  parseParams?: (searchString: string) => EncodedQuery;
  stringifyParams?: (encodedParams: EncodedQuery) => string;
  updateType?: UrlUpdateType;
  includeKnownParams?: boolean;
  includeAllParams?: boolean;
  params?: QueryParamConfigMap;

  /** when a value equals its default, do not encode it in the URL when updating */
  removeDefaultsFromUrl?: boolean;

  /**
   * @experimental this is an experimental option to combine multiple `set` calls
   * into a single URL update.
   */
  enableBatching?: boolean;
}

type RequiredOptions = 'parseParams' | 'stringifyParams';
export type QueryParamOptionsWithRequired = Required<
  Pick<QueryParamOptions, RequiredOptions>
> &
  Omit<QueryParamOptions, RequiredOptions>;

export function mergeOptions(
  parentOptions: QueryParamOptionsWithRequired,
  currOptions: QueryParamOptions | null | undefined
): QueryParamOptionsWithRequired {
  if (currOptions == null) {
    currOptions = {};
  }

  const merged = { ...parentOptions, ...currOptions };

  // deep merge param objects
  if (currOptions.params && parentOptions.params) {
    merged.params = { ...parentOptions.params, ...currOptions.params };
  }

  return merged;
}
