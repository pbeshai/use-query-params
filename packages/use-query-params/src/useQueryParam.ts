import { QueryParamConfig } from 'serialize-query-params';
import { QueryParamOptions } from './options';
import { UrlUpdateType } from './types';
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
 * @deprecated useQueryParams is overloaded to do the same thing when the arguments
 * match this style (e.g. useQueryParams('param', StringParam))
 */
export const useQueryParam = <TypeToEncode, TypeFromDecode = TypeToEncode>(
  name: string,
  paramConfig?: QueryParamConfig<TypeToEncode, TypeFromDecode>,
  options?: QueryParamOptions
): [
  TypeFromDecode,
  (newValue: NewValueType<TypeToEncode>, updateType?: UrlUpdateType) => void
] => {
  return useQueryParams(name, paramConfig, options);
};
