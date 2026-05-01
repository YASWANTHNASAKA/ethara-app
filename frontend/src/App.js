import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState('login');

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPage('login');
  };

  if (token) return <Dashboard user={user} token={token} onLogout={handleLogout} />;

  return (
    <div className="auth-wrapper">
      {page === 'login' ? (
        <Login onLogin={handleLogin} onSwitch={() => setPage('register')} />
      ) : (
        <Register onLogin={handleLogin} onSwitch={() => setPage('login')} />
      )}
    </div>
  );
}

export default App;