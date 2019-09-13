import React from 'react';
import MainPage from './MainPage';
import history from './history';

function App() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    history.listen(() => {
      forceUpdate();
    });
  }, []);

  return (
    <div className="App">
      <MainPage />
    </div>
  );
}

export default App;
