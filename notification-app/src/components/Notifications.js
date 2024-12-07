import React, { useState, useEffect } from 'react';
import api from '../apiAuth';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;