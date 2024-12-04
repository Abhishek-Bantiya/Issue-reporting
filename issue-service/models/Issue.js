const mongoose = require('mongoose');

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
  upvotedBy: {
    type: [String],
    default: [],
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

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;