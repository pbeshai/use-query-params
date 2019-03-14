import * as React from 'react';
import { useQueryParam, NumberParam } from 'use-query-params';

const UseQueryParamExample = () => {
  const [num, setNum] = useQueryParam('x', NumberParam);

  return (
    <div>
      <h1>num is {num}</h1>
      <button onClick={() => setNum(Math.random())}>Change</button>
    </div>
  );
};

export default UseQueryParamExample;
