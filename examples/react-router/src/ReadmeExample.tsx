import * as React from 'react';
import { useQueryParam, NumberParam, StringParam } from 'use-query-params';

const UseQueryParamExample = () => {
  // something like: ?x=123&foo=bar in the URL
  const [num, setNum] = useQueryParam('x', NumberParam);
  const [foo, setFoo] = useQueryParam('foo', StringParam);

  return (
    <div>
      <h1>num is {num}</h1>
      <button onClick={() => setNum(Math.random())}>Change</button>
      <h1>foo is {foo}</h1>
      <button onClick={() => setFoo(`str${Math.round(50 * Math.random())}`)}>
        Change
      </button>
    </div>
  );
};

export default UseQueryParamExample;
