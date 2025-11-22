import { useEffect, useState } from 'react';
import {
  PartialLocation,
  QueryParamAdapterComponent,
  QueryParamAdapter,
} from 'use-query-params';

function makeAdapter({ onChange }: { onChange(): void }): QueryParamAdapter {
  const adapter = {
    replace(location: PartialLocation) {
      window.history.replaceState(location.state, '', location.search || '?');
      onChange();
    },
    push(location: PartialLocation) {
      window.history.pushState(location.state, '', location.search || '?');
      onChange();
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
  const handleURLChange = () =>
    setAdapter(makeAdapter({ onChange: handleURLChange }));
  // we use a lazy caching solution to prevent #46 from happening
  const [adapter, setAdapter] = useState(() =>
    makeAdapter({ onChange: handleURLChange })
  );

  useEffect(() => {
    window.addEventListener('popstate', handleURLChange);
    return () => window.removeEventListener('popstate', handleURLChange);
  }, []);

  return children(adapter);
};
