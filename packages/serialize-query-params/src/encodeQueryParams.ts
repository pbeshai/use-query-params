import { DecodedValueMap, QueryParamConfigMap, EncodedValueMap } from './types';

/**
 * Convert the values in query to strings via the encode functions configured
 * in paramConfigMap
 *
 * @param paramConfigMap Map from query name to { encode, decode } config
 * @param query Query updates mapping param name to decoded value
 */
export function encodeQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  query: Partial<DecodedValueMap<QPCMap>>
): Partial<EncodedValueMap<QPCMap>> {
  const encodedQuery: Partial<EncodedValueMap<QPCMap>> = {};

  const paramNames = Object.keys(query);
  for (const paramName of paramNames) {
    const decodedValue = query[paramName];

    if (!paramConfigMap[paramName]) {
      // NOTE: we could just not encode it, but it is probably convenient to have
      // it be included by default as a string type.
      (encodedQuery as any)[paramName] =
        decodedValue == null ? decodedValue : String(decodedValue);
    } else {
      encodedQuery[paramName as keyof QPCMap] = paramConfigMap[
        paramName
      ].encode(query[paramName]);
    }
  }

  return encodedQuery;
}
export default encodeQueryParams;
