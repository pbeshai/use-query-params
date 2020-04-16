import * as React from 'react';
import { EncodedQueryWithNulls } from 'serialize-query-params';

import { UrlUpdateType, HistoryLocation } from './types';
import { updateUrlQuery, getLocation } from './updateUrlQuery';
import { LocationContext } from './LocationContext';

/**
 * Props for the LocationProvider.
 */
type LocationProviderProps = HistoryLocation & {
  /** Main app goes here */
  children: React.ReactNode;
};

/**
 * An internal-only context provider which provides down the most
 * recent location object and a callback to update the history.
 */
export function LocationProvider({
  history,
  location,
  children,
}: LocationProviderProps) {
  const locationRef = React.useRef(location);
  React.useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const setContext = React.useCallback(
    (queryReplacements: EncodedQueryWithNulls, updateType?: UrlUpdateType) => {
      // A ref is needed here to stop setContext updating constantly (see #46)
      locationRef.current = getLocation(
        queryReplacements,
        locationRef.current,
        updateType
      );
      if (history) {
        updateUrlQuery(history, locationRef.current, updateType);
      }
    },
    [history]
  );

  return (
    <LocationContext.Provider value={[location, setContext]}>
      {children}
    </LocationContext.Provider>
  );
}
