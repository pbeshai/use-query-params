import * as React from 'react';
import { QueryParamConfig, StringParam } from 'serialize-query-params';
import { getSSRSafeSearchString, usePreviousIfShallowEqual } from './helpers';
import { sharedMemoizedQueryParser } from './memoizedQueryParser';
import { LocationContext } from './LocationContext';
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
 * from the location available in the context.
 *
 * D = decoded type
 * D2 = return value from decode (typically same as D)
 */
export const useQueryParam = <D, D2 = D>(
  name: string,
  paramConfig: QueryParamConfig<D, D2> = StringParam as QueryParamConfig<any>
): [D2 | undefined, (newValue: D, updateType?: UrlUpdateType) => void] => {
  // const { history, location } = useQueryParamContext();
  console.warn('TODO, add back in useLocationContext for dev warning');
  const [location, setLocation] = React.useContext(LocationContext);

  // create the setter, memoizing via useCallback
  const setValue = React.useCallback(
    (newValue: D, updateType?: UrlUpdateType) => {
      const newEncodedValue = paramConfig.encode(newValue);

      setLocation({ [name]: newEncodedValue }, updateType);
    },
    [paramConfig, name, setLocation]
  );

  // read in the raw query
  const parsedQuery = sharedMemoizedQueryParser(
    getSSRSafeSearchString(location)
  );

  // read in the encoded string value (we have to use previous if available because
  // sometimes the query string changes so we get a new parsedQuery but this value
  // didn't change, so we should avoid generating a new array or whatever value)
  const encodedValue = usePreviousIfShallowEqual(parsedQuery[name]);

  // decode if the encoded value has changed, otherwise
  // re-use memoized value
  const decodedValue = React.useMemo(() => {
    return paramConfig.decode(encodedValue);
  }, [encodedValue, paramConfig]);

  return [decodedValue, setValue];
};
