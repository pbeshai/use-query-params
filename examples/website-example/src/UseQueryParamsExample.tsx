import { nanoid } from 'nanoid';
import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  NumericArrayParam,
  StringParam,
  useQueryParams,
} from 'use-query-params';

const UseQueryParamsExample = () => {
  const [query, setQuery] = useQueryParams({
    foo: StringParam,
    arr: NumericArrayParam,
  });
  const { foo, arr } = query;

  // verify we aren't creating new arrays each time
  const prevArr = React.useRef(arr);
  React.useEffect(() => {
    if (prevArr.current !== arr) {
      console.log('new array. was:', prevArr.current, 'now:', arr);
    } else {
      console.log('same array');
    }
    prevArr.current = arr;
  });

  const nextFoo = nanoid(4);
  const nextArr = [
    Math.round(Math.random() * 100),
    Math.round(Math.random() * 100),
    Math.round(Math.random() * 100),
  ];

  return (
    <div className="UseQueryParamsExample">
      <h2 className="text-center">useQueryParams Example</h2>
      <div className="example-block">
        <SyntaxHighlighter language="javascript" style={atomOneLight}>
          {`const [query, setQuery] = useQueryParams({
  foo: StringParam,
  arr: NumericArrayParam,
});
const { foo, arr } = query;`}
        </SyntaxHighlighter>
        <div>
          The value of <b>foo</b> is{' '}
          <code>{foo === undefined ? 'undefined' : JSON.stringify(foo)}</code>
          <button
            className="set-btn"
            onClick={() => setQuery({ foo: nextFoo })}
          >
            setQuery({JSON.stringify({ foo: nextFoo }, null, 2)})
          </button>
        </div>
      </div>
      <div className="example-block">
        <div>
          The value of <b>arr</b> is{' '}
          <code>{arr === undefined ? 'undefined' : JSON.stringify(arr)}</code>
          <button
            className="set-btn"
            onClick={() => setQuery({ arr: nextArr }, 'push')}
          >
            setQuery({JSON.stringify({ arr: nextArr }, null, 2)}, 'push')
          </button>
          <p>
            Since we specify the update type as <code>push</code>, the back
            button will work. If we used <code>pushIn</code>, the value of{' '}
            <b>foo</b> would be retained.
          </p>
          <button
            className="set-btn"
            onClick={() => setQuery({ arr: nextArr }, 'pushIn')}
          >
            setQuery({JSON.stringify({ arr: nextArr }, null, 2)}, 'pushIn')
          </button>
          <p>
            With <code>setQuery</code>, we can update multiple parameters at
            once.
          </p>
          <button
            className="set-btn"
            onClick={() => setQuery({ arr: nextArr, foo: nextFoo })}
          >
            setQuery({JSON.stringify({ arr: nextArr, foo: nextFoo }, null, 2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseQueryParamsExample;
