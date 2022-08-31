import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
} from 'use-query-params';

/**
 * Query Param Adapter for react-router v6
 */
export const ReactRouter6Adapter: QueryParamAdapterComponent = ({
  children,
}) => {
  // we need the navigator directly so we can access the current version
  // of location in case of multiple updates within a render (e.g. #233)
  // but we will limit our usage of it and have a backup to just use
  // useLocation() output in case of some kind of breaking change we miss.
  // see: https://github.com/remix-run/react-router/blob/f3d87dcc91fbd6fd646064b88b4be52c15114603/packages/react-router-dom/index.tsx#L113-L131
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const adapter: QueryParamAdapter = {
    replace(location) {
      navigate(location.search || '?', {
        replace: true,
        state: location.state,
      });
    },
    push(location) {
      navigate(location.search || '?', {
        replace: false,
        state: location.state,
      });
    },
    get location() {
      // be a bit defensive here in case of an unexpected breaking change in React Router
      return (navigator as any)?.location ?? location;
    },
  };

  return children(adapter);
};
