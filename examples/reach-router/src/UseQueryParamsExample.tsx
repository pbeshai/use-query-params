import * as React from 'react';
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

const UseQueryParamsExample = () => {
  const [count, setCount] = React.useState(0);

  const [query, setQuery] = useQueryParams({
    zzz: NumberParam,
    test: StringParam,
    anyp: StringParam,
  });
  const { zzz, test, anyp } = query;

  return (
    <div className="UseQueryParamsExample">
      <h2>useQueryParams Example</h2>
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
                  onClick={() =>
                    setQuery({ zzz: Math.floor(Math.random() * 10000) })
                  }
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
                    setQuery({ test: 'str' + Math.floor(Math.random() * 100) })
                  }
                >
                  Change
                </button>
                <button
                  onClick={() =>
                    setQuery({
                      zzz: Math.floor(Math.random() * 10000),
                      test: 'str' + Math.floor(Math.random() * 100),
                    })
                  }
                >
                  Change test + zzz
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
                    setQuery({ anyp: 'any' + Math.floor(Math.random() * 100) })
                  }
                >
                  Change
                </button>
                <button
                  onClick={() =>
                    setQuery(
                      { anyp: 'any' + Math.floor(Math.random() * 100) },
                      'push'
                    )
                  }
                >
                  Change Push
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UseQueryParamsExample;
