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
