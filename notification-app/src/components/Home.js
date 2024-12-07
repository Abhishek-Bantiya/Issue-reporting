import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <>
      <Header />
      <div className="container">
        {token ? (
          <>
            <h1>Welcome to the App</h1>
            <p>This is the homepage content.</p>
          </>
        ) : (
          <div className="nav-buttons">
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;