import * as React from 'react';
import { EncodedQueryWithNulls } from 'serialize-query-params';

import { UrlUpdateType } from './types';

/**
 * Shape of the LocationProviderContext, which the hooks consume to read and
 * update the URL state.
 */
type LocationProviderContext = [
  Location,
  (queryReplacements: EncodedQueryWithNulls, updateType?: UrlUpdateType) => void
];

export const LocationContext = React.createContext<LocationProviderContext>([
  {} as Location,
  () => {},
]);

export function useLocationContext() {
  const context = React.useContext(LocationContext);
  if (process.env.NODE_ENV === 'development' && context === undefined) {
    throw new Error('useQueryParams must be used within a QueryParamProvider');
  }
  return context;
}
