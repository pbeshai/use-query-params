import { EncodedValueMap, QueryParamConfigMap } from 'serialize-query-params';

/**
 * Create an alias mapping using the optional `urlName` property on params
 */
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

/**
 * Converts the stringified alias/urlName map back into an object
 */
export function deserializeUrlNameMap(
  urlNameMapStr: string | undefined
): Record<string, string> | undefined {
  if (!urlNameMapStr) return undefined;

  return Object.fromEntries(
    urlNameMapStr.split('\n').map((part) => part.split('\0'))
  );
}

/**
 * converts { searchString: 'foo'} to { q: 'foo'} if the searchString
 * is configured to have "q" as its urlName.
 */
export function applyUrlNames(
  encodedValues: Partial<EncodedValueMap<any>>,
  paramConfigMap: QueryParamConfigMap
) {
  let newEncodedValues: Partial<EncodedValueMap<any>> = {};
  for (const paramName in encodedValues) {
    if (paramConfigMap[paramName]?.urlName != null) {
      newEncodedValues[paramConfigMap[paramName].urlName!] =
        encodedValues[paramName];
    } else {
      newEncodedValues[paramName] = encodedValues[paramName];
    }
  }

  return newEncodedValues;
}
