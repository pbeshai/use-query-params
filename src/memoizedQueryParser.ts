import { parse as parseQueryString } from 'query-string';
import { EncodedQuery } from 'serialize-query-params';

export const makeMemoizedQueryParser = (
  initialSearchString?: string | undefined
) => {
  let cachedSearchString = initialSearchString;
  let cachedParsedQuery = parseQueryString(cachedSearchString || '');

  return (newSearchString: string): EncodedQuery => {
    if (cachedSearchString !== newSearchString) {
      cachedSearchString = newSearchString;
      cachedParsedQuery = parseQueryString(cachedSearchString);
    }

    return cachedParsedQuery;
  };
};

export const sharedMemoizedQueryParser = makeMemoizedQueryParser();
