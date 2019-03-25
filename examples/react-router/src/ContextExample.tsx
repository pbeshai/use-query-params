import * as React from 'react';
import { useQueryParam, BooleanParam } from 'use-query-params';

const QueryParamContext = React.createContext({
  queryParam: false,
  nonQueryParam: false,
  setQueryParam: (val: boolean) => {},
  setNonQueryParam: (val: boolean) => {},
});

const QueryParamProvider = ({ children }: { children: React.ReactNode }) => {
  const [nonQueryParam, setNonQueryParam] = React.useState(false);
  const [queryParam, setQueryParam] = useQueryParam('queryParam', BooleanParam);

  return (
    <QueryParamContext.Provider
      value={{
        queryParam: !!queryParam,
        setQueryParam,
        nonQueryParam,
        setNonQueryParam,
      }}
    >
      {children}
    </QueryParamContext.Provider>
  );
};

const InnerAll = () => {
  const {
    queryParam,
    setQueryParam,
    nonQueryParam,
    setNonQueryParam,
  } = React.useContext(QueryParamContext);
  return (
    <div className="ContextExample">
      <h3>Consumes all values in context</h3>
      <div>I rendered at {Date.now()}</div>
      <div>
        Query Param is <b>{queryParam ? 'true' : 'false'}</b>{' '}
        <button onClick={() => setQueryParam(!queryParam)}>
          Toggle Query Param
        </button>
      </div>
      <div>
        Non Query Param is <b>{nonQueryParam ? 'true' : 'false'}</b>{' '}
        <button onClick={() => setNonQueryParam(!nonQueryParam)}>
          Toggle Non Query Param
        </button>
      </div>
    </div>
  );
};

const InnerQueryParamOnly = () => {
  const { queryParam, setQueryParam } = React.useContext(QueryParamContext);
  return (
    <div className="ContextExample">
      <h3>Consumes query param only from context</h3>
      <div>I rendered at {Date.now()}</div>
      <div>
        Query Param is <b>{queryParam ? 'true' : 'false'}</b>{' '}
        <button onClick={() => setQueryParam(!queryParam)}>
          Toggle Query Param
        </button>
      </div>
    </div>
  );
};

const MemoInnerQueryParamOnly = React.memo(InnerQueryParamOnly);

const InnerNonQueryParamOnly = () => {
  const { nonQueryParam, setNonQueryParam } = React.useContext(
    QueryParamContext
  );
  return (
    <div className="ContextExample">
      <h3>Consumes non query param only from context</h3>
      <div>I rendered at {Date.now()}</div>

      <div>
        Non Query Param is <b>{nonQueryParam ? 'true' : 'false'}</b>{' '}
        <button onClick={() => setNonQueryParam(!nonQueryParam)}>
          Toggle Non Query Param
        </button>
      </div>
    </div>
  );
};

const MemoInnerNonQueryParamOnly = React.memo(InnerNonQueryParamOnly);

const ContextExample = () => {
  return (
    <QueryParamProvider>
      <h2>Context Example</h2>
      <InnerAll />
      <InnerQueryParamOnly />
      <InnerNonQueryParamOnly />
      <h2>Using React.memo</h2>
      <MemoInnerQueryParamOnly />
      <MemoInnerNonQueryParamOnly />
    </QueryParamProvider>
  );
};

export default ContextExample;
