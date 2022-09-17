// @ts-ignore
import { useHistory, useLocation } from 'react-router-dom';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
} from 'use-query-params';

/**
 * Query Param Adapter for react-router v5
 */
export const ReactRouter5Adapter: QueryParamAdapterComponent = ({
  children,
}) => {
  // note we need to useLocation() to get re-renders when location changes
  // but we prefer to read location directly from history to fix #233
  // @ts-ignore-line
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();

  const history = useHistory();

  const adapter: QueryParamAdapter = {
    replace(location) {
      history.replace(location.search || '?', location.state);
    },
    push(location) {
      history.push(location.search || '?', location.state);
    },
    get location() {
      return history.location;
    },
  };

  return children(adapter);
};
