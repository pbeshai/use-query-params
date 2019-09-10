import * as React from 'react';
import {
  parse as parseQueryString,
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

  // ref for actually version history
  const refHistory = React.useRef<typeof history>(history);
  React.useEffect(
    () => {
      refHistory.current = history;
    },
    [history]
  );

  // ref for actually version location
  const refLocation = React.useRef<typeof location>(location);
  React.useEffect(
    () => {
      refLocation.current = location;
    },
    [location]
  );

  // read in the raw query
  if (!rawQuery) {
    rawQuery = React.useMemo(() => parseQueryString(location.search) || {}, [
      location.search,
    ]);
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
        refLocation.current,
        refHistory.current,
        updateType
      );
    },
    []
  );

  return [decodedValue, setValue];
};
