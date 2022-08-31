import {
  EncodedQuery,
  QueryParamConfigMap,
  searchStringToObject,
  objectToSearchString,
} from 'serialize-query-params';
import { UrlUpdateType } from './types';

export const defaultOptions: QueryParamOptionsWithRequired = {
  searchStringToObject: searchStringToObject,
  objectToSearchString: objectToSearchString,
  updateType: 'pushIn',
  includeKnownParams: undefined,
  includeAllParams: false,
  removeDefaultsFromUrl: false,
  enableBatching: false,
  skipUpdateWhenNoChange: true,
};

export interface QueryParamOptions {
  searchStringToObject?: (searchString: string) => EncodedQuery;
  objectToSearchString?: (encodedParams: EncodedQuery) => string;
  updateType?: UrlUpdateType;
  includeKnownParams?: boolean;
  includeAllParams?: boolean;
  /** whether sets that result in no change to the location search string should be ignored (default: true) */
  skipUpdateWhenNoChange?: boolean;
  params?: QueryParamConfigMap;

  /** when a value equals its default, do not encode it in the URL when updating */
  removeDefaultsFromUrl?: boolean;

  /**
   * @experimental this is an experimental option to combine multiple `set` calls
   * into a single URL update.
   */
  enableBatching?: boolean;
}

type RequiredOptions = 'searchStringToObject' | 'objectToSearchString';
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
