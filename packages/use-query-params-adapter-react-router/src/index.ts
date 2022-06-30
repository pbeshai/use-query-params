// @ts-ignore
import { useNavigate, useLocation } from 'react-router';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
} from 'use-query-params';

/**
 * Query Param Adapter for react-router v6
 */
export const ReactRouterAdapter: QueryParamAdapterComponent = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adapter: QueryParamAdapter = {
    replace(location) {
      navigate(location, { replace: true, state: location.state });
    },
    push(location) {
      navigate(location, { replace: false, state: location.state });
    },
    get location() {
      return location;
    },
  };

  return children(adapter);
};
