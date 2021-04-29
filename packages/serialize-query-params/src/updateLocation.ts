import {
  stringify,
  StringifyOptions,
  parse as parseQueryString,
  parseUrl,
} from 'query-string';
import { EncodedQuery } from './types';

/**
 * options passed to query-string stringify plus an
 * addition of transformSearchString: a function that takes
 * the result of stringify and runs a transformation on it.
 * (e.g. replacing all instances of character x with y)
 */
export type ExtendedStringifyOptions = StringifyOptions & {
  transformSearchString?: (searchString: string) => string;
};

/**
 * An example of a transformSearchString function that undoes encoding of
 * common JSON characters that are technically allowed in URLs.
 */
const JSON_SAFE_CHARS = `{}[],":`
  .split('')
  .map((d) => [d, encodeURIComponent(d)]);
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
  stringifyOptions?: ExtendedStringifyOptions
): Location {
  let encodedSearchString = stringify(encodedQuery, stringifyOptions);
  if (stringifyOptions && stringifyOptions.transformSearchString) {
    encodedSearchString = stringifyOptions.transformSearchString(
      encodedSearchString
    );
  }
  const search = encodedSearchString.length ? `?${encodedSearchString}` : '';
  const href = parseUrl(location.href || '').url + search;

  const newLocation: Location & {
    key: string;
    query: EncodedQuery;
  } = {
    ...location,
    key: `${Date.now()}`, // needed for some routers (e.g. react-router)
    href,
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
  stringifyOptions?: ExtendedStringifyOptions
): Location {
  // explicitly avoid parsing numbers to ensure the
  // return type has the same shape as EncodeQuery
  const currQuery = parseQueryString(location.search, { parseNumbers: false }) as EncodedQuery;

  const newQuery = {
    ...currQuery,
    ...encodedQueryReplacements,
  };

  return updateLocation(newQuery, location, stringifyOptions);
}
