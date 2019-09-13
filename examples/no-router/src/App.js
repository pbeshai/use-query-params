import React from 'react';
import MainPage from './MainPage';
import history from './history';

function App() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    // listen for changes to the URL and force the app to re-render
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
