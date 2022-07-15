import { EncodedQuery } from './types';

/**
 * Default implementation of searchStringToObject powered by URLSearchParams
 * This converts a search string like `?foo=123&bar=x` to { foo: '123', bar: 'x' }
 * This is only a very basic version, you may prefer the advanced versions offered
 * by third party libraries like query-string ("parse") or qs.
 */
export function searchStringToObject(searchString: string): EncodedQuery {
  const params = new URLSearchParams(searchString);
  const parsed: EncodedQuery = {};
  for (let [key, value] of params) {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      if (Array.isArray(parsed[key])) {
        (parsed[key] as string[]).push(value);
      } else {
        parsed[key] = [parsed[key] as string, value];
      }
    } else {
      parsed[key] = value;
    }
  }

  return parsed;
}
