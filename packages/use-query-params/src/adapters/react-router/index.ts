import { QueryParamAdapter, QueryParamAdapterComponent } from '../../types';

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
    getCurrentLocation: () => location,
  };

  return children(adapter);
};
