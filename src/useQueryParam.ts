import * as React from 'react';
import {
  parse as parseQueryString,
  parseUrl as parseQueryURL,
  stringify,
  EncodedQueryWithNulls,
  StringParam,
  QueryParamConfig,
} from 'serialize-query-params';
import { QueryParamContext } from './QueryParamProvider';
import { updateUrlQuery } from './updateUrlQuery';
import { UrlUpdateType } from './types';

/**
 * Given a query param name and query parameter configuration ({ encode, decode })
 * return the decoded value and a setter for updating it.
 *
 * The setter takes two arguments (newValue, updateType) where updateType
 * is one of 'replace' | 'replaceIn' | 'push' | 'pushIn', defaulting to
 * 'replaceIn'.
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
  const { history, location } = React.useContext(QueryParamContext);

  if (!rawQuery) {
    rawQuery = React.useMemo(() => {
      let pathname = {};

      // handle checking SSR (#13)
      if (typeof location === 'object') {
        // in browser
        if (typeof window !== 'undefined') {
          pathname = parseQueryString(location.search);
        } else {
          // not in browser
          pathname = parseQueryURL(location.pathname).query;
        }
      }

      return pathname || {};
    }, [location.search, location.pathname]);
  }

  // read in the encoded string value
  const encodedValue = rawQuery[name];

  // decode if the encoded value has changed, otherwise
  // re-use memoized value
  const decodedValue = React.useMemo(() => {
    if (encodedValue == null) {
      return undefined;
    }
    return paramConfig.decode(encodedValue);

    // note that we use the stringified encoded value since the encoded
    // value may be an array that is recreated if a different query param
    // changes.
  }, [
    encodedValue instanceof Array
      ? stringify({ name: encodedValue })
      : encodedValue,
  ]);

  // create the setter, memoizing via useCallback
  const setValue = React.useCallback(
    (newValue: D, updateType?: UrlUpdateType) => {
      const newEncodedValue = paramConfig.encode(newValue);

      updateUrlQuery(
        { [name]: newEncodedValue },
        location,
        history,
        updateType
      );
    },
    [location]
  );

  return [decodedValue, setValue];
};
