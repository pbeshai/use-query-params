/**
 * Different methods for updating the URL:
 *
 * - replaceIn: Replace just a single parameter, leaving the rest as is
 * - replace: Replace all parameters with just those specified
 * - pushIn: Push just a single parameter, leaving the rest as is (back button works)
 * - push: Push all parameters with just those specified (back button works)
 */
export type UrlUpdateType = 'replace' | 'replaceIn' | 'push' | 'pushIn';

/**
 * Adapted history object that provides a consistent interface
 * for pushing or replacing updates to a URL.
 */
export interface PushReplaceHistory {
  push: (location: Location) => void;
  replace: (location: Location) => void;
}

/**
 * Location optionally extended with a query field
 */
export interface ExtendedLocation extends Location {
  query?: { [param: string]: string };
}

/**
 * Encoded query parameters (all strings)
 */
export interface EncodedQuery {
  [key: string]: string;
}

/**
 * Encoded query parameters, possibly including null or undefined values
 */
export interface EncodedQueryWithNulls {
  [key: string]: string | null | undefined;
}

/**
 * Configuration for a query param specifying how to encode it
 * (convert it to a string) and decode it (convert it from a string
 * back to its native type)
 *
 * D = type to be encoded
 * D2 = type from decode (typically = D)
 */
export interface QueryParamConfig<D, D2 = D> {
  /** Convert the query param value to a string */
  encode: (value: D) => string | undefined;

  /** Convert the query param string value to its native type */
  decode: (value: string) => D2;
}

/**
 * Mapping from a query parameter name to a { encode, decode } config
 */
export interface QueryParamConfigMap {
  [paramName: string]: QueryParamConfig<any, any>;
}

/**
 * Mapping from a query parameter name to it's decoded value type
 */
export type DecodedValueMap<QPCMap extends QueryParamConfigMap> = {
  [P in keyof QPCMap]: ReturnType<QPCMap[P]['decode']>
};

/**
 * The setter function signature mapping
 */
export type SetQuery<QPCMap extends QueryParamConfigMap> = (
  changes: Partial<DecodedValueMap<QPCMap>>,
  updateType?: UrlUpdateType
) => void;
