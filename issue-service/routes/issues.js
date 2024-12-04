const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { authenticate, authenticateAdmin } = require('../middleware/authenticate');

// Create a new issue
router.post('/issues', authenticate, async (req, res) => {
  const { description, location, area, city, photo } = req.body;
  const newIssue = new Issue({ description, location, area, city, photo, reporterId: req.user.username });
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

// Update the status of an issue (reporter or admin)
router.patch('/issues/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const issue = await Issue.findById(id);

  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  if (issue.reporterId !== req.user.username && req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Only the reporter or an admin can update the issue' });
  }

  issue.status = status;
  issue.updatedAt = Date.now();
  await issue.save();
  res.send(issue);
});

// Upvote an issue
router.post('/issues/:id/upvote', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.username;

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  if (issue.upvotedBy.includes(userId)) {
    return res.status(400).send({ error: 'User has already upvoted this issue' });
  }

  issue.upvotes += 1;
  issue.upvotedBy.push(userId);
  issue.updatedAt = Date.now();
  await issue.save();

  res.send(issue);
});

// Add a comment to an issue
router.post('/issues/:id/comments', authenticate, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const issue = await Issue.findById(id);
  issue.comments.push({ userId: req.user.username, text });
  issue.updatedAt = Date.now();
  await issue.save();
  res.status(201).send(issue);
});

// Delete a resolved issue (reporter or admin)
router.delete('/issues/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);

  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  if (issue.status !== 'Resolved') {
    return res.status(400).send({ error: 'Only resolved issues can be deleted' });
  }

  if (issue.reporterId !== req.user.username && req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Only the reporter or an admin can delete the issue' });
  }

  await Issue.findByIdAndDelete(id);
  res.status(200).send({ message: 'Issue deleted successfully' });
});

module.exports = router;