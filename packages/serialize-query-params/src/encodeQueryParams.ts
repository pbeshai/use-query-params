import {QueryParamConfigMap, EncodedValueMap, ToBeEncodedValueMap} from './types';

/**
 * Convert the values in query to strings via the encode functions configured
 * in paramConfigMap
 *
 * @param paramConfigMap Map from query name to { encode, decode } config
 * @param query Map from query name to value to be encoded
 */
export function encodeQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
  query: Partial<ToBeEncodedValueMap<QPCMap>>
): Partial<EncodedValueMap<QPCMap>> {
  const encodedQuery: Partial<EncodedValueMap<QPCMap>> = {};

  const paramNames = Object.keys(query);
  for (const paramName of paramNames) {
    const valueToBeEncoded = query[paramName];

    if (!paramConfigMap[paramName]) {
      // NOTE: we could just not encode it, but it is probably convenient to have
      // it be included by default as a string type.
      (encodedQuery as any)[paramName] =
          valueToBeEncoded == null ? valueToBeEncoded : String(valueToBeEncoded);
    } else {
      encodedQuery[paramName as keyof QPCMap] = paramConfigMap[
        paramName
      ].encode(query[paramName]);
    }
  }

  return encodedQuery;
}
export default encodeQueryParams;
