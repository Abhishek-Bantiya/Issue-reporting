import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiAuth from '../apiAuth';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiAuth.get('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')}>
        Voice
      </div>
      <nav>
        
        <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
          <span>🔔</span>
          {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
        </div>
        {showNotifications && (
          <div className="notifications-dropdown">
            <ul>
              {notifications.map(notification => (
                <li key={notification._id}>{notification.message}</li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      {token && (
        <button className="signout-button" onClick={handleSignOut}>
          Sign Out
        </button>
      )}
    </header>
  );
};

export default Header;