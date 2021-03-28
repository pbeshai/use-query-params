import * as React from 'react';
import {
  useQueryParam,
  StringParam,
  NumberParam,
  ArrayParam,
  NumericArrayParam,
} from 'use-query-params';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { nanoid } from 'nanoid';

const UseQueryParamExample = () => {
  const [foo, setFoo] = useQueryParam('foo', StringParam);
  const [arr, setArr] = useQueryParam('arr', NumericArrayParam);

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
    <div className="UseQueryParamExample">
      <h2 className="text-center">useQueryParam Example</h2>
      <div className="example-block">
        <SyntaxHighlighter language="javascript" style={atomOneLight}>
          const [foo, setFoo] = useQueryParam('foo', StringParam)
        </SyntaxHighlighter>
        <div>
          The value of <b>foo</b> is{' '}
          <code>{foo === undefined ? 'undefined' : JSON.stringify(foo)}</code>
          <button className="set-btn" onClick={() => setFoo(nextFoo)}>
            setFoo({JSON.stringify(nextFoo)})
          </button>
        </div>
      </div>
      <div className="example-block">
        <SyntaxHighlighter language="javascript" style={atomOneLight}>
          const [arr, setArr] = useQueryParam('arr', NumericArrayParam)
        </SyntaxHighlighter>
        <div>
          The value of <b>arr</b> is{' '}
          <code>{arr === undefined ? 'undefined' : JSON.stringify(arr)}</code>
          <button className="set-btn" onClick={() => setArr(nextArr, 'push')}>
            setArr({JSON.stringify(nextArr)}, 'push')
          </button>
          <p>
            Since we specify the update type as <code>push</code>, the back
            button will work. If we used <code>pushIn</code>, the value of{' '}
            <b>foo</b> would be retained.
          </p>
          <button className="set-btn" onClick={() => setArr(nextArr, 'pushIn')}>
            setArr({JSON.stringify(nextArr)}, 'pushIn')
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseQueryParamExample;
