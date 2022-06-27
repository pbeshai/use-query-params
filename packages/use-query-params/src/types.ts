import React = require('react');
import {
  QueryParamConfigMap,
  DecodedValueMap,
  EncodedQuery,
} from 'serialize-query-params';

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

// -- new --
export interface PartialLocation {
  readonly search: string;
  readonly state?: any;
}

export interface QueryParamAdapter {
  getCurrentLocation: () => PartialLocation;
  replace: (location: PartialLocation) => void;
  push: (location: PartialLocation) => void;
}

export type QueryParamAdapterComponent = ({
  children,
}: {
  children: (adapter: QueryParamAdapter) => React.ReactElement | null;
}) => React.ReactElement | null;

export interface QueryParamOptions {
  parseParams?: (searchString: string) => EncodedQuery;
  stringifyParams?: (encodedParams: EncodedQuery) => string;
}

type RequiredOptions = 'parseParams' | 'stringifyParams';
export type QueryParamOptionsWithRequired = Required<
  Pick<QueryParamOptions, RequiredOptions>
> &
  Omit<QueryParamOptions, RequiredOptions>;
