import * as React from 'react';
import { PushReplaceHistory, ExtendedLocation } from './types';

interface ReachHistory {
  navigate: (
    to: string,
    options?: {
      state?: any;
      replace?: boolean;
    }
  ) => void;
}

export interface QueryParamContextValue {
  history: PushReplaceHistory;
  location: ExtendedLocation;
}

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

function getContextValue(overrides: any = {}): QueryParamContextValue {
  const hasWindow = typeof window !== 'undefined';

  const value = {
    history: hasWindow ? adaptWindowHistory(window.history) : null,
    location: hasWindow ? window.location : null,
    ...overrides,
  };

  return value;
}

export const QueryParamContext = React.createContext(getContextValue());

interface Props {
  children: React.ReactNode;
  ReactRouterRoute?: React.ComponentClass; // react-router <Route> component
  reachHistory?: ReachHistory;
  history?: PushReplaceHistory;
  location?: ExtendedLocation;
}

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

  const overrides: any = {};
  if (history) {
    overrides.history = history;
  }
  if (location) {
    overrides.location = location;
  }

  return (
    <QueryParamContext.Provider value={getContextValue(overrides)}>
      {children}
    </QueryParamContext.Provider>
  );
}

export default QueryParamProvider;
