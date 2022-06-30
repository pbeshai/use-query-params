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
  const adapter: QueryParamAdapter = {
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
    get location() {
      return currentLocation;
    },
  };

  const Adapter = ({ children }: any) => children(adapter);
  Adapter.adapter = adapter;

  return Adapter;
}

// helper to get the query params from the updated location
export function calledPushQuery(adapter: QueryParamAdapter, index: number = 0) {
  return parseQueryString((adapter.push as any).mock.calls[index][0].search);
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
