import { parse as parseQueryString, stringify } from 'query-string';
import { EncodedQuery } from 'serialize-query-params';
import { vi } from 'vitest';
import {
  PartialLocation,
  QueryParamAdapter,
  QueryParamAdapterComponent,
} from '../types';

export function makeMockAdapter(
  currentLocation: PartialLocation
): QueryParamAdapterComponent {
  const adapter = {
    replace: vi
      .fn()
      .mockImplementation((newLocation) =>
        Object.assign(currentLocation, newLocation)
      ),
    push: vi
      .fn()
      .mockImplementation((newLocation) =>
        Object.assign(currentLocation, newLocation)
      ),
    getCurrentLocation() {
      return currentLocation;
    },
  };

  const Adapter = ({ children }) => children(adapter);
  Adapter.adapter = adapter;

  return Adapter;
}

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
export function calledPushQuery(adapter: QueryParamAdapter, index: number = 0) {
  return parseQueryString(adapter.push.mock.calls[index][0].search);
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
