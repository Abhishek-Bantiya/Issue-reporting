const mongoose = require('../db/connection');

const notificationSchema = new mongoose.Schema({
  userId: String,
  issueId: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);