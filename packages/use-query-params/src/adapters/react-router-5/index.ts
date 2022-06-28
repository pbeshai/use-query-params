import { useHistory, useLocation } from 'react-router';
import { QueryParamAdapter, QueryParamAdapterComponent } from '../../types';

export const ReactRouter5Adapter: QueryParamAdapterComponent = ({
  children,
}) => {
  const location = useLocation();
  const history = useHistory();

  const adapter: QueryParamAdapter = {
    replace(location) {
      history.replace(location, location.state);
    },
    push(location) {
      history.replace(location, location.state);
    },
    getCurrentLocation: () => location,
  };

  return children(adapter);
};
