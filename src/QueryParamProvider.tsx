import * as React from 'react';

interface Props {
  children: React.ReactNode;
  ReactRouterRoute: React.ComponentClass; // react-router <Route> component
}

function getContextValue(overrides: any = {}) {
  const hasWindow = typeof window !== 'undefined';

  const value = {
    history: hasWindow ? window.history : null,
    location: hasWindow ? window.location : null,
    ...overrides,
  };

  return value;
}

export const QueryParamContext = React.createContext(getContextValue());

export function QueryParamProvider({ children, ReactRouterRoute }: Props) {
  // if we have React Router, use it to get the context value
  if (ReactRouterRoute) {
    return (
      <ReactRouterRoute>
        {(routeProps: any) => {
          console.log('got route props', routeProps);
          return (
            <QueryParamContext.Provider value={getContextValue(routeProps)}>
              {children}
            </QueryParamContext.Provider>
          );
        }}
      </ReactRouterRoute>
    );
  }

  // use
  return (
    <QueryParamContext.Provider value={getContextValue()}>
      {children}
    </QueryParamContext.Provider>
  );
}

export default QueryParamProvider;
