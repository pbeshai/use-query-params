import {
  EncodedQuery,
  updateLocation,
  updateInLocation,
  ExtendedStringifyOptions,
} from 'serialize-query-params';
import { PushReplaceHistory, UrlUpdateType } from './types';

/**
 * Creates a new location object containing the specified query changes.
 * If replaceIn or pushIn are used as the updateType, then parameters
 * not specified in queryReplacements are retained. If replace or push
 * are used, only the values in queryReplacements will be available.
 * The default is pushIn.
 */
export function createLocationWithChanges(
  queryReplacements: EncodedQuery,
  location: Location,
  updateType: UrlUpdateType = 'pushIn',
  stringifyOptions?: ExtendedStringifyOptions
): Location {
  switch (updateType) {
    case 'replace':
    case 'push':
      return updateLocation(queryReplacements, location, stringifyOptions);
    case 'replaceIn':
    case 'pushIn':
    default:
      return updateInLocation(queryReplacements, location, stringifyOptions);
  }
}

/**
 * Updates the URL to the new location.
 */
export function updateUrlQuery(
  history: PushReplaceHistory,
  location: Location,
  updateType: UrlUpdateType = 'pushIn'
): void {
  switch (updateType) {
    case 'pushIn':
    case 'push':
      history.push(location);
      break;
    case 'replaceIn':
    case 'replace':
    default:
      history.replace(location);
      break;
  }
}
