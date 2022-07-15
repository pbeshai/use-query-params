import { stringify } from 'query-string';
import { EncodedQuery } from '..';

export function makeMockLocation(query: EncodedQuery): Location {
  const queryStr = stringify(query);
  const search = queryStr.length ? `?${queryStr}` : '';
  return {
    protocol: 'http:',
    host: 'localhost:3000',
    pathname: '/',
    search,
    href: 'http://localhost:3000/' + search,
    key: `mock-${Date.now()}`,
  } as Location & { key: string };
}
