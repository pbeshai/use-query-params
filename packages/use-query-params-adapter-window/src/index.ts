import { useState } from 'react';
import { PartialLocation, QueryParamAdapterComponent } from 'use-query-params';

function makeAdapter() {
  const adapter = {
    replace(location: PartialLocation) {
      window.history.replaceState(location.state, '', location.search || '?');
    },
    push(location: PartialLocation) {
      window.history.pushState(location.state, '', location.search || '?');
    },
    get location() {
      return window.location;
    },
  };

  return adapter;
}

/**
 * Adapts standard DOM window history to work with our
 * { replace, push } interface.
 */
export const WindowHistoryAdapter: QueryParamAdapterComponent = ({
  children,
}) => {
  // we use a lazy caching solution to prevent #46 from happening
  const [adapter] = useState(makeAdapter);

  return children(adapter);
};
