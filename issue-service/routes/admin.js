const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables
const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use a secure secret in production
// Middleware to authenticate and authorize admins
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Unauthorized' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err || decoded.role !== 'admin') return res.status(401).send({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// Fetch all issues (admin only)
router.get('/issues', authenticateAdmin, async (req, res) => {
  const issues = await Issue.find();
  res.send(issues);
});

// Update the status of any issue (admin only)
router.patch('/issues/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedIssue = await Issue.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true });
  res.send(updatedIssue);
});

// Delete any resolved issue (admin only)
router.delete('/issues/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);

  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  if (issue.status !== 'Resolved') {
    return res.status(400).send({ error: 'Only resolved issues can be deleted' });
  }

  await Issue.findByIdAndDelete(id);
  res.status(200).send({ message: 'Issue deleted successfully' });
});

module.exports = router;