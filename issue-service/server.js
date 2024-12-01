const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const issueRoutes = require('./routes/issues');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
require('./db/connection'); // Ensure the database connection is established
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', issueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Notifications & Insights Service is running',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// WebSocket server
const wss = new WebSocket.Server({ server: app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}) });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

module.exports = wss;
