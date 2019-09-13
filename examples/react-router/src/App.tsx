import * as React from 'react';
import { Link } from 'react-router-dom';
import UseQueryParamExample from './UseQueryParamExample';
import UseQueryParamsExample from './UseQueryParamsExample';
import WithQueryParamsExample from './WithQueryParamsExample';
import ReadmeExample from './ReadmeExample';
import ReadmeExample2 from './ReadmeExample2';

import './App.css';

const App = (props: any) => {
  const [example, setExample] = React.useState(0);

  return (
    <div className="App">
      <h1>Demos</h1>
      <div>
        <button onClick={() => setExample(0)}>useQueryParam Example</button>
        <button onClick={() => setExample(1)}>useQueryParams Example</button>
        <button onClick={() => setExample(2)}>withQueryParams Example</button>
        <button onClick={() => setExample(3)}>README Example</button>
        <button onClick={() => setExample(4)}>README Example 2</button>
        <div>
          <Link to={`/?test=${Math.floor(Math.random() * 10)}`}>
            Push New URL
          </Link>
        </div>
      </div>
      <div>
        {example === 0 && <UseQueryParamExample />}
        {example === 1 && <UseQueryParamsExample />}
        {example === 2 && <WithQueryParamsExample />}
        {example === 3 && <ReadmeExample />}
        {example === 4 && <ReadmeExample2 />}
      </div>
    </div>
  );
};

export default App;
