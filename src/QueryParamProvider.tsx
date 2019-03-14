import * as React from 'react';
import { PushReplaceHistory, ExtendedLocation } from './types';

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
 * Shape of the QueryParamContext, needed to update the URL
 * and know its current state.
 */
export interface QueryParamContextValue {
  history: PushReplaceHistory;
  location: ExtendedLocation;
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
        `${location.protocol}//${location.host}${location.pathname}${
          location.search
        }`
      );
    },
    push(location: Location) {
      history.pushState(
        (location as any).state,
        '',
        `${location.protocol}//${location.host}${location.pathname}${
          location.search
        }`
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
        `${location.protocol}//${location.host}${location.pathname}${
          location.search
        }`,
        { replace: true }
      );
    },
    push(location: Location) {
      history.navigate(
        `${location.protocol}//${location.host}${location.pathname}${
          location.search
        }`,
        { replace: false }
      );
    },
  };
}

/**
 * Helper to produce the context value falling back to
 * window history and location if not provided.
 */
function getContextValue(
  contextValue: Partial<QueryParamContextValue> = {}
): QueryParamContextValue {
  const value = { ...contextValue };

  const hasWindow = typeof window !== 'undefined';
  if (hasWindow) {
    if (!value.history) {
      value.history = adaptWindowHistory(window.history);
    }
    if (!value.location) {
      value.location = window.location;
    }
  }

  return value as QueryParamContextValue;
}

export const QueryParamContext = React.createContext(getContextValue());

/**
 * Props for the Provider component, used to hook the active routing
 * system into our controls.
 */
interface Props {
  /** Main app goes here */
  children: React.ReactNode;
  /** `Route` from react-router */
  ReactRouterRoute?: React.ComponentClass;
  /** `globalHistory` from @reach/router */
  reachHistory?: ReachHistory;
  /** Manually provided history that meets the { replace, push } interface */
  history?: PushReplaceHistory;
  /**
   * Override location object, otherwise window.location or the
   * location provided by the active routing system is used.
   */
  location?: ExtendedLocation;
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
}: Props) {
  // if we have React Router, use it to get the context value
  if (ReactRouterRoute) {
    return (
      <ReactRouterRoute>
        {(routeProps: any) => {
          return (
            <QueryParamContext.Provider value={getContextValue(routeProps)}>
              {children}
            </QueryParamContext.Provider>
          );
        }}
      </ReactRouterRoute>
    );
  }

  // if we are using reach router, use its history
  if (reachHistory) {
    return (
      <QueryParamContext.Provider
        value={getContextValue({
          history: adaptReachHistory(reachHistory),
          location,
        })}
      >
        {children}
      </QueryParamContext.Provider>
    );
  }

  // neither reach nor react-router, so allow manual overrides
  return (
    <QueryParamContext.Provider value={getContextValue({ history, location })}>
      {children}
    </QueryParamContext.Provider>
  );
}

export default QueryParamProvider;
