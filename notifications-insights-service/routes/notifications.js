const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const { getWebSocketServer } = require('../websocket');

const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use a secure secret in production

// Middleware to authenticate users
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Unauthorized' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// Send a notification
router.post('/notifications/send', authenticate, async (req, res) => {
  const { userId, issueId, message } = req.body;
  const newNotification = new Notification({ userId, issueId, message });
  await newNotification.save();

  // Send real-time notification
  const wss = getWebSocketServer();
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newNotification));
    }
  });

  res.status(201).send(newNotification);
});

module.exports = router;