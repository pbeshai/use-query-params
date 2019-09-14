import React from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

export default function MainPage() {
  const [{ foo }, setQuery] = useQueryParams({ foo: NumberParam });
  return (
    <div>
      <h1>foo={foo}</h1>
      <button onClick={() => setQuery({ foo: ~~(Math.random() * 10000) })}>
        replaceIn
      </button>
      <button
        onClick={() => setQuery({ foo: ~~(Math.random() * 10000) }, 'pushIn')}
      >
        pushIn
      </button>
    </div>
  );
}
