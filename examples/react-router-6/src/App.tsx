import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <nav>
        <NavLink to="/useQueryParam">useQueryParam example</NavLink>
        <NavLink to="/useQueryParams">useQueryParams example</NavLink>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
