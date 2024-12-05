const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { authenticateAdmin } = require('../middleware/authenticate');

// Middleware to authenticate and authorize admins
router.use(authenticateAdmin);

// Admin route to get all issues
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.send(issues);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    res.status(500).send({ error: 'Failed to fetch issues' });
  }
});

// Admin route to delete an issue
router.delete('/issues/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).send({ error: 'Issue not found' });
    }
    await Issue.findByIdAndDelete(id);
    res.status(200).send({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Failed to delete issue:', error);
    res.status(500).send({ error: 'Failed to delete issue' });
  }
});

// Admin route to get overall issue reports
router.get('/reports/overall', async (req, res) => {
  try {
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const issuesByArea = await Issue.aggregate([
      { $group: { _id: "$area", count: { $sum: 1 } } }
    ]);
    const issuesByCity = await Issue.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } }
    ]);
    res.json({ issuesByStatus, issuesByArea, issuesByCity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate overall reports' });
  }
});

module.exports = router;