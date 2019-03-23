import {
  stringify,
  parse as parseQueryString,
  EncodedQueryWithNulls,
} from 'serialize-query-params';

// if passed a location, will mutate it so we can see what changes are being made
export function makeMockHistory(location: any = {}) {
  return {
    replace: jest
      .fn()
      .mockImplementation(newLocation => Object.assign(location, newLocation)),
    push: jest
      .fn()
      .mockImplementation(newLocation => Object.assign(location, newLocation)),
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

export function makeMockLocation(query: EncodedQueryWithNulls): Location {
  const queryStr = stringify(query);
  return {
    protocol: 'http:',
    host: 'localhost',
    pathname: '/',
    search: queryStr.length ? `?${queryStr}` : '',
  } as Location;
}
