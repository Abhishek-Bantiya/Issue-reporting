const jwt = require('jsonwebtoken');
const axios = require('axios');

const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/users/${decoded.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data;
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authenticateUser;