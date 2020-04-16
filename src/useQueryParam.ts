import * as React from 'react';
import {
  parse as parseQueryString,
  parseUrl as parseQueryURL,
  stringify,
} from 'query-string';

import {
  EncodedQueryWithNulls,
  StringParam,
  QueryParamConfig,
} from 'serialize-query-params';
import { useQueryParamContext } from './QueryParamProvider';
import { updateUrlQuery } from './updateUrlQuery';
import { UrlUpdateType } from './types';

/**
 * Given a query param name and query parameter configuration ({ encode, decode })
 * return the decoded value and a setter for updating it.
 *
 * The setter takes two arguments (newValue, updateType) where updateType
 * is one of 'replace' | 'replaceIn' | 'push' | 'pushIn', defaulting to
 * 'pushIn'.
 *
 * You may optionally pass in a rawQuery object, otherwise the query is derived
 * from the location available in the QueryParamContext.
 *
 * D = decoded type
 * D2 = return value from decode (typically same as D)
 */
export const useQueryParam = <D, D2 = D>(
  name: string,
  paramConfig: QueryParamConfig<D, D2> = StringParam as QueryParamConfig<any>,
  rawQuery?: EncodedQueryWithNulls
): [D2 | undefined, (newValue: D, updateType?: UrlUpdateType) => void] => {
  const { history, location } = useQueryParamContext();

  // ref with current version history object (see #46)
  const refHistory = React.useRef(history);
  React.useEffect(() => {
    refHistory.current = history;
  }, [history]);

  // ref with current version location object (see #46)
  const refLocation = React.useRef(location);
  React.useEffect(() => {
    refLocation.current = location;
  }, [location]);

  // read in the raw query
  if (!rawQuery) {
    const locationIsObject = typeof location === 'object';
    const windowIsDefined = typeof window !== 'undefined';
    rawQuery = React.useMemo(() => {
      let pathname = {};

      // handle checking SSR (#13)
      if (locationIsObject) {
        // in browser
        if (windowIsDefined) {
          pathname = parseQueryString(location.search);
        } else {
          // not in browser
          let url = location.pathname;
          if (location.search) {
            url += location.search;
          }

          pathname = parseQueryURL(url).query;
        }
      }

      return pathname || {};
    }, [location.search, location.pathname, locationIsObject, windowIsDefined]);
  }

  // read in the encoded string value
  const encodedValue = rawQuery[name];

  // note that we use the stringified encoded value since the encoded
  // value may be an array that is recreated if a different query param
  // changes. It is sufficient to use this instead of encodedValue in
  // the useMemo dependency array since it will change any time the actual
  // meaningful value of encodedValue changes.
  const arraySafeEncodedValue =
    encodedValue instanceof Array
      ? stringify({ [name]: encodedValue })
      : encodedValue;

  // decode if the encoded value has changed, otherwise
  // re-use memoized value
  const decodedValue = React.useMemo(() => {
    return paramConfig.decode(encodedValue);
  }, [arraySafeEncodedValue, paramConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  // create the setter, memoizing via useCallback
  const setValue = React.useCallback(
    (newValue: D, updateType?: UrlUpdateType) => {
      const newEncodedValue = paramConfig.encode(newValue);

      updateUrlQuery(
        { [name]: newEncodedValue },
        refHistory.current.location || refLocation.current, // see #46 for why we use a ref here
        refHistory.current,
        updateType
      );
    },
    [paramConfig, name]
  );

  return [decodedValue, setValue];
};
