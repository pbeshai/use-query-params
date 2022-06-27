import { parse as parseQueryString, stringify } from 'query-string';
import { EncodedQuery } from 'serialize-query-params';
import { vi } from 'vitest';

// if passed a location, will mutate it so we can see what changes are being made
export function makeMockHistory(location: any = {}) {
  return {
    replace: vi
      .fn()
      .mockImplementation((newLocation) =>
        Object.assign(location, newLocation)
      ),
    push: vi
      .fn()
      .mockImplementation((newLocation) =>
        Object.assign(location, newLocation)
      ),
    location,
  };
}

// helper to get the query params from the updated location
export function calledReplaceQuery(
  history: ReturnType<typeof makeMockHistory>,
  index: number = 0
) {
  return parseQueryString(history.replace.mock.calls[index][0].search);
}

// helper to get the query params from the updated location
export function calledPushQuery(
  history: ReturnType<typeof makeMockHistory>,
  index: number = 0
) {
  return parseQueryString(history.push.mock.calls[index][0].search);
}

export function makeMockLocation(
  query: EncodedQuery,
  includeHost: boolean = false
): Location {
  const queryStr = stringify(query);
  let newLocation = {
    pathname: '/',
    search: queryStr.length ? `?${queryStr}` : '',
  } as Location;

  if (includeHost) {
    newLocation.protocol = 'http:';
    newLocation.host = 'localhost';
  }

  return newLocation;
}
