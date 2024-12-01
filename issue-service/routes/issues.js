const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables
const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use a secure secret in production
// Middleware to authenticate and authorize users
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Unauthorized' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// Create a new issue
router.post('/issues', authenticate, async (req, res) => {
  const { description, location, area, city, photo } = req.body;
  const newIssue = new Issue({ description, location, area, city, photo, reporterId: req.user.userId });
  await newIssue.save();
  res.status(201).send(newIssue);
});

// Fetch issues based on a single parameter (id, area, or city)
router.get('/issues', async (req, res) => {
  const { id, area, city } = req.query;
  let issues;

  try {
    if (id) {
      issues = await Issue.find({ _id: id });
    } else if (city) {
      issues = await Issue.find({ city });
    } else if (area) {
      issues = await Issue.find({ area });
    } else {
      return res.status(400).send({ error: 'Please provide id, city, or area to fetch issues' });
    }

    res.send(issues);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    res.status(500).send({ error: 'Failed to fetch issues' });
  }
});


// Fetch open issues by location
router.get('/issues', async (req, res) => {
  const { status, location, area, city } = req.query;
  let issues;

  if (location) {
    issues = await Issue.find({ status, location });
  } else if (city) {
    issues = await Issue.find({ status, city });
  } else if (area) {
    issues = await Issue.find({ status, area });
  } else {
    issues = await Issue.find({ status });
  }

  res.send(issues);
});

// Fetch details of a specific issue
router.get('/issues/:id', async (req, res) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }
  res.send(issue);
});

// Update the status of an issue
router.patch('/issues/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const issue = await Issue.findById(id);

  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  if (status === 'Resolved' && issue.reporterId !== req.user.userId) {
    return res.status(403).send({ error: 'Only the person who reported the issue can mark it as resolved' });
  }

  issue.status = status;
  issue.updatedAt = Date.now();
  await issue.save();
  res.send(issue);
});

// Upvote an issue
router.post('/issues/:id/upvote', authenticate, async (req, res) => {
  const { id } = req.params;
  const updatedIssue = await Issue.findByIdAndUpdate(id, { $inc: { upvotes: 1 }, updatedAt: Date.now() }, { new: true });
  res.send(updatedIssue);
});

// Add a comment to an issue
router.post('/issues/:id/comments', authenticate, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const issue = await Issue.findById(id);
  issue.comments.push({ userId: req.user.userId, text });
  issue.updatedAt = Date.now();
  await issue.save();
  res.status(201).send(issue);
});

// Delete a resolved issue
router.delete('/issues/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);

  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  if (issue.status !== 'Resolved') {
    return res.status(400).send({ error: 'Only resolved issues can be deleted' });
  }

  if (issue.reporterId !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Only the reporter or an admin can delete the issue' });
  }

  await Issue.findByIdAndDelete(id);
  res.status(200).send({ message: 'Issue deleted successfully' });
});

module.exports = router;