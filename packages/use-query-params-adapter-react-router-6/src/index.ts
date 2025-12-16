import { useCallback, useContext, useEffect, useRef } from 'react';
import {
  UNSAFE_NavigationContext,
  useNavigate,
  useLocation,
  UNSAFE_DataRouterContext,
} from 'react-router-dom';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
} from 'use-query-params';

// Prevent premature calls to useNavigate() from failing with "You should call
// navigate() in a React.useEffect(), not when your component is first
// rendered".
//
// This warning happens even when navigate() is called from a useEffect(),
// because that useEffect is called before useNavigate's internal useEffect
// (parents' effects are invoked after children's effects).
//
// To get around this, enqueue premature useNavigate() calls, and process the
// queue in a useEffect() (which is called *after* useNavigate's effect).
//
// See: https://github.com/pbeshai/use-query-params/issues/211
function useNavigateDeferred() {
  const realNavigate = useNavigate();
  const navigateState = useRef({ isValid: false, navigate: realNavigate, queue: [] });

  if(navigateState.current.navigate !== realNavigate) {
    navigateState.current.isValid = false
  }

  const navigate = useCallback((to: any, options: any) => {
    if(navigateState.current.isValid) {
      navigateState.current.navigate(to, options);
    }
    else {
      navigateState.current.queue.push([to, options]);
    }
  }, [])

  useEffect(() => {
    navigateState.current.isValid = true
    navigateState.current.navigate = realNavigate

    while(navigateState.current.queue.length > 0) {
      const [to, options] = navigateState.current.queue.shift()
      navigateState.current.navigate(to, options)
    }
  }, [realNavigate])

  return navigate
}

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
  const navigate = useNavigateDeferred()
  const router = useContext(UNSAFE_DataRouterContext)?.router;
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
      return (
        router?.state?.location ?? (navigator as any)?.location ?? location
      );
    },
  };

  return children(adapter);
};
