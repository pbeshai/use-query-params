import * as React from 'react';
import { EncodedQuery, ExtendedStringifyOptions } from 'serialize-query-params';

import { UrlUpdateType, HistoryLocation } from './types';
import { updateUrlQuery, createLocationWithChanges } from './updateUrlQuery';

/**
 * Shape of the LocationProviderContext, which the hooks consume to read and
 * update the URL state.
 */
type LocationProviderContext = {
  location: Location;
  getLocation: () => Location;
  setLocation: (
    queryReplacements: EncodedQuery,
    updateType?: UrlUpdateType
  ) => void;
};

const providerlessContextValue = {
  location: {} as Location,
  getLocation: () => ({} as Location),
  setLocation: () => {},
};

export const LocationContext = React.createContext<LocationProviderContext>(
  providerlessContextValue
);

export function useLocationContext() {
  const context = React.useContext(LocationContext);
  if (
    process.env.NODE_ENV !== 'production' &&
    (context === undefined || context === providerlessContextValue)
  ) {
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
  stringifyOptions?: ExtendedStringifyOptions;
};

/**
 * An internal-only context provider which provides down the most
 * recent location object and a callback to update the history.
 */
export function LocationProvider({
  history,
  location,
  children,
  stringifyOptions,
}: LocationProviderProps) {
  const locationRef = React.useRef(location);
  React.useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // TODO: we can probably simplify this now that we are reading location from history
  const getLocation = React.useCallback(() => locationRef.current, [
    locationRef,
  ]);

  const setLocation = React.useCallback(
    (queryReplacements: EncodedQuery, updateType?: UrlUpdateType) => {
      // A ref is needed here to stop setLocation updating constantly (see #46)
      locationRef.current = createLocationWithChanges(
        queryReplacements,
        history == null || history.location == null
          ? locationRef.current
          : history.location,
        updateType,
        stringifyOptions
      );
      if (history) {
        updateUrlQuery(history, locationRef.current, updateType);
      }
    },
    [history, stringifyOptions]
  );

  return (
    <LocationContext.Provider value={{ location, getLocation, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}
