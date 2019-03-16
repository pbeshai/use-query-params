import * as React from 'react';
import {
  useQueryParam,
  StringParam,
  NumberParam,
  ArrayParam,
} from 'use-query-params';

const MyParam = {
  encode: (val: number) => `MY_${val}`,
  decode: (input: string | string[] | undefined) => {
    const str = input instanceof Array ? input[0] : input;
    return str == null ? undefined : +str.split('_')[1];
  },
};

const UseQueryParamExample = () => {
  const [count, setCount] = React.useState(0);
  const [zzz, setZzz] = useQueryParam('zzz', NumberParam);
  const [custom, setCustom] = useQueryParam('custom', MyParam);
  const [test, setTest] = useQueryParam('test', StringParam);
  const [anyp, setAnyP] = useQueryParam('anyp');
  const [arr, setArr] = useQueryParam('arr', ArrayParam);

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

  return (
    <div className="UseQueryParamExample">
      <h2>useQueryParam Example</h2>
      <div>
        <button onClick={() => setCount(count + 1)}>
          Click to change component state and cause a re-render: {count}
        </button>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <td>zzz</td>
              <td>{zzz}</td>
              <td>{typeof zzz}</td>
              <td>
                <button
                  onClick={() => setZzz(Math.floor(Math.random() * 10000))}
                >
                  Change
                </button>
              </td>
            </tr>
            <tr>
              <td>custom</td>
              <td>{custom}</td>
              <td>{typeof custom}</td>
              <td>
                <button
                  onClick={() => setCustom(Math.floor(Math.random() * 10000))}
                >
                  Change
                </button>
              </td>
            </tr>
            <tr>
              <td>test</td>
              <td>{test}</td>
              <td>{typeof test}</td>
              <td>
                <button
                  onClick={() =>
                    setTest('str' + Math.floor(Math.random() * 100))
                  }
                >
                  Change
                </button>
              </td>
            </tr>
            <tr>
              <td>anyp</td>
              <td>{anyp}</td>
              <td>{typeof anyp}</td>
              <td>
                <button
                  onClick={() =>
                    setAnyP('any' + Math.floor(Math.random() * 100))
                  }
                >
                  Change
                </button>
                <button
                  onClick={() =>
                    setAnyP('any' + Math.floor(Math.random() * 100), 'push')
                  }
                >
                  Change Push
                </button>
              </td>
            </tr>
            <tr>
              <td>arr</td>
              <td>
                {arr
                  ? arr.map((d: string, i: number) => (
                      <div key={i}>
                        arr[{i}] = {d}
                      </div>
                    ))
                  : arr}
              </td>
              <td>{typeof arr}</td>
              <td>
                <button
                  onClick={() =>
                    setArr([
                      'arr' + Math.floor(Math.random() * 10),
                      'arr' + Math.floor(Math.random() * 10),
                    ])
                  }
                >
                  Change
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UseQueryParamExample;
