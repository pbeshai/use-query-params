import * as React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  NumberParam,
  QueryParamProvider,
  useQueryParam,
} from 'use-query-params';

const App = ({}) => {
  return (
    <BrowserRouter>
      {/* adapt for react-router v6 */}
      <QueryParamProvider ReactRouterRoute={RouteAdapter}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  );
};

/**
 * This is the main thing you need to use to adapt the react-router v6
 * API to what use-query-params expects.
 *
 * Pass this as the `ReactRouterRoute` prop to QueryParamProvider.
 */
const RouteAdapter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adaptedHistory = React.useMemo(
    () => ({
      replace(location) {
        navigate(location, { replace: true, state: location.state });
      },
      push(location) {
        navigate(location, { replace: false, state: location.state });
      },
    }),
    [navigate]
  );
  return children({ history: adaptedHistory, location });
};

const Home = ({}) => {
  const [foo, setFoo] = useQueryParam('foo', NumberParam);
  const [bar, setBar] = useQueryParam('bar', NumberParam);

  return (
    <div>
      <h1>Home</h1>
      <div>
        foo = {foo === undefined ? 'undefined' : JSON.stringify(foo)}, bar ={' '}
        {bar === undefined ? 'undefined' : JSON.stringify(bar)}{' '}
      </div>
      <div>
        <button onClick={() => setFoo(Math.floor(Math.random() * 100))}>
          pushIn foo
        </button>
        <button
          onClick={() => setFoo(Math.floor(Math.random() * 100), 'replaceIn')}
        >
          replaceIn foo
        </button>
        <button onClick={() => setFoo(Math.floor(Math.random() * 100), 'push')}>
          push foo
        </button>
        <button
          onClick={() => setFoo(Math.floor(Math.random() * 100), 'replace')}
        >
          replace foo
        </button>
      </div>
      <div>
        <button onClick={() => setBar(Math.floor(Math.random() * 100))}>
          pushIn bar
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
