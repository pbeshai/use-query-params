import { EncodedQuery } from 'serialize-query-params';
import shallowEqual from './shallowEqual';
import { deserializeUrlNameMap } from './urlName';

let cachedSearchString: string | undefined;
let cachedUrlNameMapString: string | undefined;
let cachedSearchStringToObjectFn:
  | ((searchString: string) => EncodedQuery)
  | undefined;
let cachedParsedQuery: EncodedQuery = {};

/**
 * cached conversion of ?foo=1&bar=2 to { foo: '1', bar: '2' }
 */
export const memoSearchStringToObject = (
  searchStringToObject: (searchString: string) => EncodedQuery,
  searchString?: string | undefined,
  /** optionally provide a mapping string to handle renames via `urlName`
   * mapping are separated by \n and mappings are urlName\0paramName
   */
  urlNameMapStr?: string | undefined
) => {
  // if we have a cached version, just return it
  if (
    cachedSearchString === searchString &&
    cachedSearchStringToObjectFn === searchStringToObject &&
    cachedUrlNameMapString === urlNameMapStr
  ) {
    return cachedParsedQuery;
  }

  cachedSearchString = searchString;
  cachedSearchStringToObjectFn = searchStringToObject;
  const newParsedQuery = searchStringToObject(searchString ?? '');
  cachedUrlNameMapString = urlNameMapStr;

  const urlNameMap = deserializeUrlNameMap(urlNameMapStr);

  // keep old values for keys if they are the same
  for (let [key, value] of Object.entries(newParsedQuery)) {
    // handle url name mapping
    if (urlNameMap?.[key]) {
      delete newParsedQuery[key];
      key = urlNameMap[key];
      newParsedQuery[key] = value;
    }

    const oldValue = cachedParsedQuery[key];
    if (shallowEqual(value, oldValue)) {
      newParsedQuery[key] = oldValue;
    }
  }

  cachedParsedQuery = newParsedQuery;
  return newParsedQuery;
};
