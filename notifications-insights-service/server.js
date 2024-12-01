const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const notificationRoutes = require('./routes/notifications');
const insightRoutes = require('./routes/insights');
require('./db/connection'); // Ensure the database connection is established
const { setupWebSocketServer } = require('./websocket');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', notificationRoutes);
app.use('/api', insightRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Notifications & Insights Service is running',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Start server and set up WebSocket server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

setupWebSocketServer(server);