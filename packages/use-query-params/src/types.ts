import { QueryParamConfigMap, DecodedValueMap } from 'serialize-query-params';

/**
 * Different methods for updating the URL:
 *
 * - replaceIn: Replace just a single parameter, leaving the rest as is
 * - replace: Replace all parameters with just those specified
 * - pushIn: Push just a single parameter, leaving the rest as is (back button works)
 * - push: Push all parameters with just those specified (back button works)
 */
export type UrlUpdateType = 'replace' | 'replaceIn' | 'push' | 'pushIn';

/**
 * Adapted history object that provides a consistent interface
 * for pushing or replacing updates to a URL.
 */
export interface PushReplaceHistory {
  push: (location: Location) => void;
  replace: (location: Location) => void;
  location?: Location; // make it optional so we can be backwards compatible (added in 1.1.2)
}

/**
 * The setter function signature mapping
 */
export type SetQuery<QPCMap extends QueryParamConfigMap> = (
  changes:
    | Partial<DecodedValueMap<QPCMap>>
    | ((
        latestValues: DecodedValueMap<QPCMap>
      ) => Partial<DecodedValueMap<QPCMap>>),
  updateType?: UrlUpdateType
) => void;

export interface HistoryLocation {
  /**
   * History that meets the { replace, push } interface.
   * May be missing when run server-side.
   */
  history?: PushReplaceHistory;
  /** The location object */
  location: Location;
}
