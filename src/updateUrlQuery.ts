import {
  EncodedQueryWithNulls,
  updateLocation,
  updateInLocation,
} from 'serialize-query-params';
import { PushReplaceHistory, UrlUpdateType } from './types';

/**
 * Creates a new location containing the specified query changes.
 * If replaceIn or pushIn are used as the updateType, then parameters
 * not specified in queryReplacements are retained. If replace or push
 * are used, only the values in queryReplacements will be available.
 */
export function getLocation(
  queryReplacements: EncodedQueryWithNulls,
  location: Location,
  updateType: UrlUpdateType = 'replaceIn'
): Location {
  switch (updateType) {
    case 'replaceIn':
    case 'pushIn':
      return updateInLocation(queryReplacements, location);
    case 'replace':
    case 'push':
      return updateLocation(queryReplacements, location);
    default:
      throw new Error('Invalid updateType');
  }
}

/**
 * Updates the URL to the new location.
 */
export function updateUrlQuery(
  history: PushReplaceHistory,
  location: Location,
  updateType: UrlUpdateType = 'replaceIn'
): void {
  switch (updateType) {
    case 'replaceIn':
    case 'replace':
      history.replace(location);
      break;
    case 'pushIn':
    case 'push':
      history.push(location);
      break;
    default:
  }
}
