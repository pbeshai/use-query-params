// @ts-ignore
import { useHistory, useLocation } from 'react-router';
import { QueryParamAdapter, QueryParamAdapterComponent } from '../../types';

/**
 * Query Param Adapter for react-router v5
 */
export const ReactRouter5Adapter: QueryParamAdapterComponent = ({
  children,
}) => {
  const location = useLocation();
  const history = useHistory();

  const adapter: QueryParamAdapter = {
    replace(location) {
      history.replace(location.search, location.state);
    },
    push(location) {
      history.push(location.search, location.state);
    },
    get location() {
      return location;
    },
  };

  return children(adapter);
};
