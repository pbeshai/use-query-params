import * as React from 'react';
import { PushReplaceHistory } from './types';
import {
  LocationContext,
  LocationProvider,
  HistoryLocation,
} from './LocationProvider';

export { LocationContext };

/**
 * Subset of a @reach/router history object. We only
 * care about the navigate function.
 */
interface ReachHistory {
  navigate: (
    to: string,
    options?: {
      state?: any;
      replace?: boolean;
    }
  ) => void;
}

/**
 * Adapts standard DOM window history to work with our
 * { replace, push } interface.
 *
 * @param history Standard history provided by DOM
 */
function adaptWindowHistory(history: History): PushReplaceHistory {
  return {
    replace(location: Location) {
      history.replaceState(
        (location as any).state,
        '',
        `${location.protocol}//${location.host}${location.pathname}${location.search}`
      );
    },
    push(location: Location) {
      history.pushState(
        (location as any).state,
        '',
        `${location.protocol}//${location.host}${location.pathname}${location.search}`
      );
    },
  };
}

/**
 * Adapts @reach/router history to work with our
 * { replace, push } interface.
 *
 * @param history globalHistory from @reach/router
 */
function adaptReachHistory(history: ReachHistory): PushReplaceHistory {
  return {
    replace(location: Location) {
      history.navigate(
        `${location.protocol}//${location.host}${location.pathname}${location.search}`,
        { replace: true }
      );
    },
    push(location: Location) {
      history.navigate(
        `${location.protocol}//${location.host}${location.pathname}${location.search}`,
        { replace: false }
      );
    },
  };
}

/**
 * Helper to produce the context value falling back to
 * window history and location if not provided.
 *
 * TODO type better.
 */
function getLocationProps({
  history,
  location,
}: Partial<HistoryLocation> = {}) {
  const value = { history, location };

  const hasWindow = typeof window !== 'undefined';
  if (hasWindow) {
    if (!value.history) {
      value.history = adaptWindowHistory(window.history);
    }
    if (!value.location) {
      value.location = window.location;
    }
  }

  return value as HistoryLocation;
}

/**
 * Props for the Provider component, used to hook the active routing
 * system into our controls.
 */
interface QueryParamProviderProps {
  /** Main app goes here */
  children: React.ReactNode;
  /** `Route` from react-router */
  ReactRouterRoute?: React.ComponentClass | React.FunctionComponent;
  /** `globalHistory` from @reach/router */
  reachHistory?: ReachHistory;
  /** Manually provided history that meets the { replace, push } interface */
  history?: PushReplaceHistory;
  /**
   * Override location object, otherwise window.location or the
   * location provided by the active routing system is used.
   */
  location?: Location;
}

/**
 * Context provider for query params to have access to the
 * active routing system, enabling updates to the URL.
 */
export function QueryParamProvider({
  children,
  ReactRouterRoute,
  reachHistory,
  history,
  location,
}: QueryParamProviderProps) {
  // if we have React Router, use it to get the context value
  if (ReactRouterRoute) {
    return (
      <ReactRouterRoute>
        {(routeProps: any) => {
          return (
            <LocationProvider {...getLocationProps(routeProps)}>
              {children}
            </LocationProvider>
          );
        }}
      </ReactRouterRoute>
    );
  }

  // if we are using reach router, use its history
  if (reachHistory) {
    return (
      <LocationProvider
        {...getLocationProps({
          history: adaptReachHistory(reachHistory),
          location,
        })}
      >
        {children}
      </LocationProvider>
    );
  }

  // neither reach nor react-router, so allow manual overrides
  return (
    <LocationProvider {...getLocationProps({ history, location })}>
      {children}
    </LocationProvider>
  );
}

export default QueryParamProvider;
