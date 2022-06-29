import { EncodedValueMap, QueryParamConfigMap } from 'serialize-query-params';

export function serializeUrlNameMap(
  paramConfigMap: QueryParamConfigMap
): string | undefined {
  let urlNameMapParts: string[] | undefined;
  for (const paramName in paramConfigMap) {
    if (paramConfigMap[paramName].urlName) {
      const urlName = paramConfigMap[paramName].urlName;
      const part = `${urlName}\0${paramName}`;
      if (!urlNameMapParts) urlNameMapParts = [part];
      else urlNameMapParts.push(part);
    }
  }

  return urlNameMapParts ? urlNameMapParts.join('\n') : undefined;
}

export function deserializeUrlNameMap(
  urlNameMapStr: string | undefined
): Record<string, string> | undefined {
  if (!urlNameMapStr) return undefined;

  return Object.fromEntries(
    urlNameMapStr.split('\n').map((part) => part.split('\0'))
  );
}

/**
 * Note: This function is destructive - it mutates encodedValues.
 * Replaces keys with their urlNames
 */
export function applyUrlNames(
  encodedValues: Partial<EncodedValueMap<any>>,
  paramConfigMap: QueryParamConfigMap
) {
  let newEncodedValues: Partial<EncodedValueMap<any>> = {};
  for (const paramName in encodedValues) {
    if (paramConfigMap[paramName]?.urlName) {
      newEncodedValues[paramConfigMap[paramName].urlName] =
        encodedValues[paramName];
    } else {
      newEncodedValues[paramName] = encodedValues[paramName];
    }
  }

  return newEncodedValues;
}
