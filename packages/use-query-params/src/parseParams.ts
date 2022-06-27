import { EncodedQuery } from 'serialize-query-params';

/**
 * Default implementation of parseParams powered by URLSearchParams
 */
export function parseParams(searchString: string): EncodedQuery {
  const params = new URLSearchParams(searchString);
  const parsed: EncodedQuery = {};
  for (let [key, value] of params) {
    if (parsed.hasOwnProperty(key)) {
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
