import { stringify, parse as parseQueryString } from 'query-string';
import {
  PushReplaceHistory,
  UrlUpdateType,
  EncodedQuery,
  EncodedQueryWithNulls,
} from './types';

/**
 * Mutates a location object to use the query parameters passed in
 */
function mergeLocationQueryOrSearch(
  location: Location,
  newQuery: EncodedQuery
): Location {
  let newLocation: Location;

  // if location.query exists, update the query in location.
  // otherwise update the search string
  if ((location as any).query) {
    newLocation = {
      ...location,
      query: newQuery,
      search: '', // this was necessary at least for React Router v4
    } as any;
  } else {
    // replace location.search
    const queryStr = stringify(newQuery);
    const search = queryStr.length ? `?${queryStr}` : '';
    newLocation = {
      ...location,
      search,
    };
  }

  // update react router key
  (newLocation as any).key = `${Date.now()}`;

  return newLocation;
}

/**
 * remove query params that are nully or an empty strings.
 * note: these values are assumed to be already encoded as strings.
 */
function filterNully(query: EncodedQueryWithNulls): EncodedQuery {
  const filteredQuery: EncodedQuery = Object.keys(query).reduce(
    (queryAccumulator: any, queryParam: string) => {
      // get encoded value for this param
      const encodedValue = query[queryParam];

      // if it isn't null or empty string, add it to the accumulated obj
      if (encodedValue != null && encodedValue !== '') {
        queryAccumulator[queryParam] = encodedValue;
      }

      return queryAccumulator;
    },
    {}
  );

  return filteredQuery;
}

/**
 * Update a location, wiping out parameters not included in newQuery
 */
function updateLocation(newQuery: EncodedQueryWithNulls, location: Location) {
  return mergeLocationQueryOrSearch(location, filterNully(newQuery));
}

/**
 * Update a location while retaining existing parameters
 */
function updateInLocation(
  queryReplacements: EncodedQueryWithNulls,
  location: Location
) {
  // if a query is there, use it, otherwise parse the search string
  const currQuery =
    (location as any).query || parseQueryString(location.search);

  const newQuery = {
    ...currQuery,
    ...queryReplacements,
  };

  return updateLocation(filterNully(newQuery), location);
}

/**
 * Updates the URL to match the specified query changes.
 * If replaceIn or pushIn are used as the updateType, then parameters
 * not specified in queryReplacements are retained. If replace or push
 * are used, only the values in queryReplacements will be available.
 */
export function updateUrlQuery(
  queryReplacements: EncodedQueryWithNulls,
  location: Location,
  history: PushReplaceHistory,
  updateType: UrlUpdateType = 'replaceIn'
): void {
  switch (updateType) {
    case 'replaceIn':
      history.replace(updateInLocation(queryReplacements, location));
      break;
    case 'pushIn':
      history.push(updateInLocation(queryReplacements, location));
      break;
    case 'replace':
      history.replace(updateLocation(queryReplacements, location));
      break;
    case 'push':
      history.push(updateLocation(queryReplacements, location));
      break;
    default:
  }
}

export default updateUrlQuery;
