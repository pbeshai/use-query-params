import React from 'react';
import { NumberParam, useQueryParam } from 'use-query-params';

// https://github.com/pbeshai/use-query-params/pull/46
export default function Issue46() {
  const [a = 1, setA] = useQueryParam('a', NumberParam);
  const [b, setB] = React.useState(1);

  React.useEffect(() => {
    console.log('effect');
    if (b % 2 === 0) {
      setA(b);
    }
  }, [b, setA]);

  return (
    <div>
      <h4>a: {a}</h4>
      <h4>b: {b}</h4>
      <button type="button" onClick={() => setB(b + 1)}>
        up
      </button>
    </div>
  );
}
