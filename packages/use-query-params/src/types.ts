import {
  QueryParamConfigMap,
  DecodedValueMap,
  QueryParamConfig,
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

export interface PartialLocation {
  readonly search: string;
  readonly state?: any;
}

export interface QueryParamAdapter {
  location: PartialLocation;
  replace: (location: PartialLocation) => void;
  push: (location: PartialLocation) => void;
}
// for backwards compat
export type PushReplaceHistory = QueryParamAdapter;

export type QueryParamAdapterComponent = ({
  children,
}: {
  children: (adapter: QueryParamAdapter) => React.ReactElement | null;
}) => React.ReactElement | null;

export type QueryParamConfigMapWithInherit = Record<
  string,
  QueryParamConfig<any, any> | string
>;
