const mongoose = require('../db/connection');

const commentSchema = new mongoose.Schema({
  userId: String,
  text: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const issueSchema = new mongoose.Schema({
  description: String,
  location: String,
  area: String,
  city: String,
  photo: String,
  reporterId: String,
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Issue', issueSchema);