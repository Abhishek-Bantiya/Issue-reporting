import React, { useState } from 'react';
import api from '../api';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, { username, password, email });
      localStorage.setItem('token', response.data.token);
      alert('Authentication successful');
    } catch (error) {
      alert('Authentication failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {!isLogin && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />}
      <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      <button type="button" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </button>
    </form>
  );
};

export default Auth;