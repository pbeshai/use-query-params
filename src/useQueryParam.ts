import * as React from 'react';
import { parse as parseQueryString, ParsedQuery } from 'query-string';
import { QueryParamContext } from './QueryParamProvider';
import { StringParam } from './params';
import { updateUrlQuery } from './updateUrlQuery';
import { UrlUpdateType, QueryParamConfig } from './types';

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
  rawQuery?: ParsedQuery
): [D2 | undefined, (newValue: D, updateType?: UrlUpdateType) => void] => {
  const { history, location } = React.useContext(QueryParamContext);

  // read in the raw query
  if (!rawQuery) {
    rawQuery = React.useMemo(
      () =>
        (location.query as ParsedQuery) ||
        parseQueryString(location.search) ||
        {},
      [location.query, location.search]
    );
  }

  // read in the encoded string value
  const encodedValue = rawQuery[name];

  // decode if the encoded value has changed, otherwise re-use memoized value
  const decodedValue = React.useMemo(() => {
    if (encodedValue == null) {
      return undefined;
    }
    return paramConfig.decode(encodedValue);
  }, [encodedValue]);

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
