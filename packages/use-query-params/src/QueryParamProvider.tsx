import * as React from 'react';
import { HistoryLocation, PushReplaceHistory } from './types';
import { LocationProvider } from './LocationProvider';
import { ExtendedStringifyOptions } from 'serialize-query-params';
import shallowEqual from './shallowEqual';

// we use a lazy caching solution to prevent #46 from happening
let cachedWindowHistory: History | undefined;
let cachedAdaptedWindowHistory: PushReplaceHistory | undefined;
/**
 * Adapts standard DOM window history to work with our
 * { replace, push } interface.
 *
 * @param history Standard history provided by DOM
 */
function adaptWindowHistory(history: History): PushReplaceHistory {
  if (history === cachedWindowHistory && cachedAdaptedWindowHistory != null) {
    return cachedAdaptedWindowHistory;
  }

  const adaptedWindowHistory = {
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
    get location() {
      return window.location;
    },
  };

  cachedWindowHistory = history;
  cachedAdaptedWindowHistory = adaptedWindowHistory;

  return adaptedWindowHistory;
}

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
  location: Location;
}

// we use a lazy caching solution to prevent #46 from happening
let cachedReachHistory: ReachHistory | undefined;
let cachedAdaptedReachHistory: PushReplaceHistory | undefined;
/**
 * Adapts @reach/router history to work with our
 * { replace, push } interface.
 *
 * @param history globalHistory from @reach/router
 */
function adaptReachHistory(history: ReachHistory): PushReplaceHistory {
  if (history === cachedReachHistory && cachedAdaptedReachHistory != null) {
    return cachedAdaptedReachHistory;
  }

  const adaptedReachHistory = {
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
    get location() {
      return history.location;
    },
  };

  cachedReachHistory = history;
  cachedAdaptedReachHistory = adaptedReachHistory;

  return adaptedReachHistory;
}

/**
 * Helper to produce the context value falling back to
 * window history and location if not provided.
 */
export function getLocationProps({
  history,
  location,
}: Partial<HistoryLocation> = {}): HistoryLocation {
  const hasWindow = typeof window !== 'undefined';
  if (hasWindow) {
    if (!history) {
      history = adaptWindowHistory(window.history);
    }
    if (!location) {
      location = window.location;
    }
  }
  if (!location) {
    throw new Error(`
        Could not read the location. Is the router wired up correctly?
      `);
  }
  return { history, location };
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

  /**
   * Options to customize the stringifying of the query string
   * These are passed directly to query-string.stringify, with
   * the exception of transformSearchString which runs on the result
   * of stringify if provided.
   */
  stringifyOptions?: ExtendedStringifyOptions;
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
  stringifyOptions,
}: QueryParamProviderProps) {
  // cache the stringify options object so we users can just do
  // <QueryParamProvider stringifyOptions={{ encode: false }} />
  const stringifyOptionsRef = React.useRef(stringifyOptions);
  const hasNewStringifyOptions = !shallowEqual(
    stringifyOptionsRef.current,
    stringifyOptions
  );
  const stringifyOptionsCached = hasNewStringifyOptions
    ? stringifyOptions
    : stringifyOptionsRef.current;
  React.useEffect(() => {
    stringifyOptionsRef.current = stringifyOptionsCached;
  }, [stringifyOptionsCached]);

  // if we have React Router, use it to get the context value
  if (ReactRouterRoute) {
    return (
      <ReactRouterRoute>
        {(routeProps: any) => {
          return (
            <LocationProvider
              stringifyOptions={stringifyOptionsCached}
              {...getLocationProps(routeProps)}
            >
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
        stringifyOptions={stringifyOptionsCached}
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
    <LocationProvider
      stringifyOptions={stringifyOptionsCached}
      {...getLocationProps({ history, location })}
    >
      {children}
    </LocationProvider>
  );
}

export default QueryParamProvider;
