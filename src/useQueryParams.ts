import * as React from 'react';
import { parse as parseQueryString, ParsedQuery } from 'query-string';
import { useQueryParam, QueryParamConfig } from './useQueryParam';
import updateUrlQuery, { EncodedQueryWithNulls } from './updateUrlQuery';
import { QueryParamContext } from './QueryParamProvider';
import { UrlUpdateType } from './types';

interface QueryParamConfigMap {
  [paramName: string]: QueryParamConfig<any>;
}

type DecodedValueMap<QPCMap extends QueryParamConfigMap> = {
  [P in keyof QPCMap]: ReturnType<QPCMap[P]['decode']>
};

type SetQuery<QPCMap extends QueryParamConfigMap> = (
  changes: Partial<DecodedValueMap<QPCMap>>,
  updateType?: UrlUpdateType
) => void;

export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const { history, location } = React.useContext(QueryParamContext);

  // read in the raw query
  const rawQuery =
    (location.query as ParsedQuery) || parseQueryString(location.search) || {};

  // parse each parameter

  const paramNames = Object.keys(paramConfigMap);
  const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
  for (const paramName of paramNames) {
    decodedValues[paramName] = useQueryParam(
      paramName,
      paramConfigMap[paramName],
      rawQuery
    )[0];
  }

  const setQuery = React.useCallback(
    (changes: Partial<DecodedValueMap<QPCMap>>, updateType?: UrlUpdateType) => {
      // encode as strings for the URL
      const encodedChanges: EncodedQueryWithNulls = {};
      const changingParamNames = Object.keys(changes);
      for (const paramName of changingParamNames) {
        if (!paramConfigMap[paramName]) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `Skipping encoding parameter ${paramName} since it was not configured.`
            );
          }
          continue;
        }
        encodedChanges[paramName] = paramConfigMap[paramName].encode(
          changes[paramName]
        );
      }

      // update the URL
      updateUrlQuery(encodedChanges, location, history, updateType);
    },
    [location]
  );

  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
};

export default useQueryParams;
