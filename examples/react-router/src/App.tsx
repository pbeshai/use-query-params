import * as React from 'react';
import { Link } from 'react-router-dom';
import UseQueryParamExample from './UseQueryParamExample';
import ReadmeExample from './ReadmeExample';
import ReadmeExample2 from './ReadmeExample2';
import UseQueryParamsExample from './UseQueryParamsExample';
import './App.css';
import ContextExample from './ContextExample';

const App = (props: any) => {
  const [example, setExample] = React.useState(0);

  return (
    <div className="App">
      <h1>Demos</h1>
      <div>
        <button onClick={() => setExample(0)}>useQueryParam Example</button>
        <button onClick={() => setExample(1)}>useQueryParams Example</button>
        <button onClick={() => setExample(2)}>README Example</button>
        <button onClick={() => setExample(3)}>README Example 2</button>
        <button onClick={() => setExample(4)}>Context Example</button>
        <Link to={`/?test=${Math.floor(Math.random() * 10)}`}>
          Push New URL
        </Link>
      </div>
      <div>
        {example === 0 && <UseQueryParamExample />}
        {example === 1 && <UseQueryParamsExample />}
        {example === 2 && <ReadmeExample />}
        {example === 3 && <ReadmeExample2 />}
        {example === 4 && <ContextExample />}
      </div>
    </div>
  );
};

export default App;
