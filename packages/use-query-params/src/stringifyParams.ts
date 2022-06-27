import { EncodedQuery } from 'serialize-query-params';

/**
 * Default implementation of stringifyParams powered by URLSearchParams.
 * Does not support null values
 */
export function stringifyParams(encodedParams: EncodedQuery): string {
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
