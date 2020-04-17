import * as React from 'react';
import { EncodedQuery } from 'serialize-query-params';

import { UrlUpdateType, HistoryLocation } from './types';
import { updateUrlQuery, createLocationWithChanges } from './updateUrlQuery';

/**
 * Shape of the LocationProviderContext, which the hooks consume to read and
 * update the URL state.
 */
type LocationProviderContext = [
  () => Location,
  (queryReplacements: EncodedQuery, updateType?: UrlUpdateType) => void
];

export const LocationContext = React.createContext<LocationProviderContext>([
  () => ({} as Location),
  () => {},
]);

export function useLocationContext() {
  const context = React.useContext(LocationContext);
  if (process.env.NODE_ENV === 'development' && context === undefined) {
    throw new Error('useQueryParams must be used within a QueryParamProvider');
  }
  return context;
}

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

  const getLocation = React.useCallback(() => locationRef.current, [
    locationRef,
  ]);

  const setLocation = React.useCallback(
    (queryReplacements: EncodedQuery, updateType?: UrlUpdateType) => {
      // A ref is needed here to stop setLocation updating constantly (see #46)
      locationRef.current = createLocationWithChanges(
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
    <LocationContext.Provider value={[getLocation, setLocation]}>
      {children}
    </LocationContext.Provider>
  );
}
