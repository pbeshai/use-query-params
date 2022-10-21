import { EncodedQuery } from './types';
import { objectToSearchString } from './objectToSearchString';
import { searchStringToObject } from '.';

/**
 * An example of a transformSearchString function that undoes encoding of
 * common JSON characters that are technically allowed in URLs.
 */
const JSON_SAFE_CHARS = `{}[],":`
  .split('')
  .map((d) => [d, encodeURIComponent(d)]);

function getHrefFromLocation(location: Location, search: string): string {
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
  let href: string = search;

  if (location.href) {
      // TODO - implement base option if location.href is relative
      //  see https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#syntax
    try {
      const url = new URL(location.href);
      href = `${url.origin}${url.pathname}${search}`;
    } catch (e) {
      href = '';
    }
  }

  return href;
}

export function transformSearchStringJsonSafe(searchString: string): string {
  let str = searchString;
  for (let [char, code] of JSON_SAFE_CHARS) {
    str = str.replace(new RegExp('\\' + code, 'g'), char);
  }
  return str;
}

/**
 * Update a location, wiping out parameters not included in encodedQuery
 * If a param is set to undefined it will be removed from the URL.
 */
export function updateLocation(
  encodedQuery: EncodedQuery,
  location: Location,
  objectToSearchStringFn = objectToSearchString
): Location {
  let encodedSearchString = objectToSearchStringFn(encodedQuery);

  const search = encodedSearchString.length ? `?${encodedSearchString}` : '';

  const newLocation: Location & {
    key: string;
    query: EncodedQuery;
  } = {
    ...location,
    key: `${Date.now()}`, // needed for some routers (e.g. react-router)
    href: getHrefFromLocation(location, search),
    search,
    query: encodedQuery, // needed for some routers (e.g. found)
  };

  return newLocation;
}

/**
 * Update a location while retaining existing parameters.
 * If a param is set to undefined it will be removed from the URL.
 */
export function updateInLocation(
  encodedQueryReplacements: EncodedQuery,
  location: Location,
  objectToSearchStringFn = objectToSearchString,
  searchStringToObjectFn = searchStringToObject
): Location {
  // explicitly avoid parsing numbers to ensure the
  // return type has the same shape as EncodeQuery
  const currQuery = searchStringToObjectFn(location.search);

  const newQuery = {
    ...currQuery,
    ...encodedQueryReplacements,
  };

  return updateLocation(newQuery, location, objectToSearchStringFn);
}
