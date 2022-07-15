import { EncodedQuery } from './types';

/**
 * Default implementation of objectToSearchString powered by URLSearchParams.
 * Does not support null values. Does not prefix with "?"
 * This converts an object { foo: '123', bar: 'x' } to a search string `?foo=123&bar=x`
 * This is only a very basic version, you may prefer the advanced versions offered
 * by third party libraries like query-string ("stringify") or qs.
 */
export function objectToSearchString(encodedParams: EncodedQuery): string {
  const params = new URLSearchParams();
  const entries = Object.entries(encodedParams);

  for (const [key, value] of entries) {
    if (value === undefined) continue;
    if (value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item ?? '');
      }
    } else {
      params.append(key, value);
    }
  }

  return params.toString();
}
