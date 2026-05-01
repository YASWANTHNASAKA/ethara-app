import React, { useState } from 'react';
import axios from 'axios';

function Register({ onLogin, onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) return setError('All fields required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-box">
      <h2>Create Account 🚀</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
      <p>Already have an account? <span onClick={onSwitch}>Login</span></p>
    </div>
  );
}

export default Register;