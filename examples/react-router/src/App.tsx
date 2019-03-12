import * as React from 'react';
import { Link } from 'react-router-dom';
import UseQueryParamExample from './UseQueryParamExample';
import UseQueryParamsExample from './UseQueryParamsExample';
import './App.css';

const App = (props: any) => {
  const [example, setExample] = React.useState(0);

  return (
    <div className="App">
      <h1>Demos</h1>
      <div>
        <button onClick={() => setExample(0)}>useQueryParam Example</button>
        <button onClick={() => setExample(1)}>useQueryParams Example</button>
        <Link to={`/?test=${Math.floor(Math.random() * 10)}`}>
          Push New URL
        </Link>
      </div>
      <div>
        {example === 0 && <UseQueryParamExample />}
        {example === 1 && <UseQueryParamsExample />}
      </div>
    </div>
  );
};

export default App;
