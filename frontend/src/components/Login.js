import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return setError('All fields required');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-box">
      <h2>Welcome Back 👋</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>Don't have an account? <span onClick={onSwitch}>Register</span></p>
    </div>
  );
}

export default Login;