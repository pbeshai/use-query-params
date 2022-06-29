import { EncodedValueMap, QueryParamConfigMap } from 'serialize-query-params';

/**
 * Note: This function is destructive - it mutates encodedValues.
 * Remove values that match the encoded defaults from the encodedValues object
 */
export function removeDefaults(
  encodedValues: Partial<EncodedValueMap<any>>,
  paramConfigMap: QueryParamConfigMap
) {
  for (const paramName in encodedValues) {
    // does it have a configured default and does it have a non-undefined value?
    if (
      paramConfigMap[paramName]?.default !== undefined &&
      encodedValues[paramName] !== undefined
    ) {
      // does its current value match the encoded default
      const encodedDefault = paramConfigMap[paramName].encode(
        paramConfigMap[paramName].default
      );
      if (encodedDefault === encodedValues[paramName]) {
        encodedValues[paramName] = undefined;
      }
    }
  }
}
