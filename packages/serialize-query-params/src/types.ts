/**
 * Encoded query parameters, possibly including null or undefined values
 */
export interface EncodedQuery {
  [key: string]: string | (string | null)[] | null | undefined;
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
  encode: (value: D) => string | (string | null)[] | null | undefined;

  /** Convert the query param string value to its native type */
  decode: (value: string | (string | null)[] | null | undefined) => D2;

  /** Checks if two values are equal (otherwise typically shallowEqual will be used) */
  equals?: (valueA: D | D2, valueB: D | D2) => boolean;

  /**
   * optionally provide a default value for other tooling

   * @note not typically used by serialize-query-params, but use-query-params
   * does and it would be annoying for there to be two slightly different
   * types.
   */
  default?: D2;

  /**
   * optionally provide a different name when in the URL for other tooling

   * @note not typically used by serialize-query-params, but use-query-params
   * does and it would be annoying for there to be two slightly different
   * types.
   */
  urlName?: string;
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
  [P in keyof QPCMap]: ReturnType<QPCMap[P]['decode']>;
};

/**
 * Mapping from a query parameter name to it's encoded value type
 */
export type EncodedValueMap<QPCMap extends QueryParamConfigMap> = {
  [P in keyof QPCMap]: string | (string | null)[] | null | undefined;
};
