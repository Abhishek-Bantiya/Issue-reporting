const axios = require('axios');
require('dotenv').config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002/auth';

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Unauthorized' });

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    req.user = response.data;
    next();
  } catch (error) {
    console.error('Error validating token:', error.response ? error.response.data : error.message);
    res.status(401).send({ error: 'Unauthorized' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Unauthorized' });

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data;
    if (!user.is_admin) return res.status(403).send({ error: 'Forbidden' });
    req.user = user;
    next();
  } catch (error) {
    console.error('Error validating token:', error.response ? error.response.data : error.message);
    res.status(401).send({ error: 'Unauthorized' });
  }
};

module.exports = { authenticate, authenticateAdmin };