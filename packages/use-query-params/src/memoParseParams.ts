import { EncodedQuery } from 'serialize-query-params';
import shallowEqual from './shallowEqual';

let cachedSearchString: string | undefined;
let cachedParseParamsFn: ((searchString: string) => EncodedQuery) | undefined;
let cachedParsedQuery: EncodedQuery = {};

export const memoParseParams = (
  parseParams: (searchString: string) => EncodedQuery,
  searchString?: string | undefined
) => {
  if (
    cachedSearchString === searchString &&
    cachedParseParamsFn === parseParams
  ) {
    return cachedParsedQuery;
  }

  cachedSearchString = searchString;
  cachedParseParamsFn = parseParams;
  const newCachedParsedQuery = parseParams(searchString ?? '');

  // keep old values for keys if they are the same
  for (const [key, value] of Object.entries(newCachedParsedQuery)) {
    const oldValue = cachedParsedQuery[key];
    if (shallowEqual(value, oldValue)) {
      newCachedParsedQuery[key] = oldValue;
    }
  }

  cachedParsedQuery = newCachedParsedQuery;
  return newCachedParsedQuery;
};
