import * as React from 'react';
import { Link } from 'react-router-dom';
import UseQueryParamExample from './UseQueryParamExample';
import UseQueryParamsExample from './UseQueryParamsExample';
import './App.css';

const App = (props: any) => {
  const [example, setExample] = React.useState(1);

  return (
    <div className="App">
      <header className="text-center">
        <h1>useQueryParams</h1>
        <div className="ext-nav">
          <a href="https://github.com/pbeshai/use-query-params">GitHub</a>
        </div>
        <div className="nav">
          <button
            className={example === 0 ? 'active' : undefined}
            onClick={() => setExample(0)}
          >
            useQueryParam
          </button>
          <button
            className={example === 1 ? 'active' : undefined}
            onClick={() => setExample(1)}
          >
            useQueryParams
          </button>
        </div>
      </header>
      <div>
        {example === 0 && <UseQueryParamExample />}
        {example === 1 && <UseQueryParamsExample />}
      </div>
    </div>
  );
};

export default App;
