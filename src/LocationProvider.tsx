import * as React from 'react';
import { UrlUpdateType, PushReplaceHistory } from './types';

type LocationProviderContext = [
  Location,
  (
    updater: (oldLocation: Location) => Location,
    updateType?: UrlUpdateType
  ) => void
];

export const LocationContext = React.createContext<LocationProviderContext>([
  {} as Location,
  () => {},
]);

export interface HistoryLocation {
  /** History that meets the { replace, push } interface */
  history: PushReplaceHistory;
  /** * Initial location object */
  location: Location;
}

/**
 * Props for the internal-only Location Provider component.
 */
interface LocationProviderProps {
  /** Main app goes here */
  children: React.ReactNode;
  /** History that meets the { replace, push } interface */
  history: PushReplaceHistory;
  /** * Initial location object */
  location: Location;
}

export function LocationProvider({
  location,
  history,
  children,
}: LocationProviderProps) {
  const locationRef = React.useRef(location);
  React.useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const setContext = React.useCallback(
    (
      updater: (oldLocation: Location) => Location,
      updateType?: UrlUpdateType
    ) => {
      // Location ref needed to stop setContext updating constantly - see #46
      locationRef.current = updater(locationRef.current);
      switch (updateType) {
        case 'pushIn':
        case 'push':
          history.push(locationRef.current);
          break;
        case 'replaceIn':
        case 'replace':
        default:
          history.replace(locationRef.current);
          break;
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
