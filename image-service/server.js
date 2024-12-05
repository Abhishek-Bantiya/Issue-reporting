const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const imageRoutes = require('./routes/images'); // Import image routes

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/images', imageRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Image Service is running',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});