import * as React from 'react';
import { Link } from 'react-router-dom';
import UseQueryParamExample from './UseQueryParamExample';
import UseQueryParamsExample from './UseQueryParamsExample';
import WithQueryParamsExample from './WithQueryParamsExample';
import RenderPropsExample from './RenderPropsExample';
import ReadmeExample from './ReadmeExample';
import ReadmeExample2 from './ReadmeExample2';
import ReadmeExample3 from './ReadmeExample3';
import ReadmeExample4 from './ReadmeExample4';

import ReadmeExample3Mapped from './ReadmeExample3Mapped';
import Issue46 from './Issue46';

const App = (props: any) => {
  const [example, setExample] = React.useState(0);

  return (
    <div className="App">
      <nav>
        <button onClick={() => setExample(0)}>useQueryParam Example</button>
        <button onClick={() => setExample(1)}>useQueryParams Example</button>
        <button onClick={() => setExample(2)}>withQueryParams Example</button>
        <button onClick={() => setExample(3)}>
          &lt;QueryParams&gt; Render Props Example
        </button>
        <button onClick={() => setExample(4)}>README Example</button>
        <button onClick={() => setExample(5)}>README Example 2</button>
        <button onClick={() => setExample(6)}>README Example 3</button>
        <button onClick={() => setExample(7)}>README Example 3 (Mapped)</button>
        <button onClick={() => setExample(8)}>README Example 4</button>
        <button onClick={() => setExample(46)}>Issue46</button>
        <div>
          <Link to={`/?test=${Math.floor(Math.random() * 10)}`}>
            Push New URL
          </Link>
        </div>
      </nav>
      <div>
        {example === 0 && <UseQueryParamExample />}
        {example === 1 && <UseQueryParamsExample />}
        {example === 2 && <WithQueryParamsExample />}
        {example === 3 && <RenderPropsExample />}
        {example === 4 && <ReadmeExample />}
        {example === 5 && <ReadmeExample2 />}
        {example === 6 && <ReadmeExample3 />}
        {example === 7 && <ReadmeExample3Mapped extra={99} />}
        {example === 8 && <ReadmeExample4 />}
        {example === 46 && <Issue46 />}
      </div>
    </div>
  );
};

export default App;
