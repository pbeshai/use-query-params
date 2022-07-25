// @ts-ignore
import { globalHistory } from '@reach/router';
import { useState } from 'react';
import { PartialLocation, QueryParamAdapterComponent } from 'use-query-params';

function makeAdapter() {
  const adapter = {
    replace(location: PartialLocation) {
      globalHistory.navigate(location.search || '?', {
        replace: true,
        state: location.state,
      });
    },
    push(location: PartialLocation) {
      globalHistory.navigate(location.search || '?', {
        replace: false,
        state: location.state,
      });
    },

    get location() {
      return globalHistory.location;
    },
  };

  return adapter;
}

/**
 * Adapts @reach/router history to work with our
 * { replace, push } interface.
 */
export const ReachAdapter: QueryParamAdapterComponent = ({ children }) => {
  // we use a lazy caching solution to prevent #46 from happening
  const [adapter] = useState(makeAdapter);

  return children(adapter);
};
