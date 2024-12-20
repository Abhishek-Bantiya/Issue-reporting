const express = require('express');
const axios = require('axios');
const router = express.Router();
const Issue = require('../models/Issue');
const { authenticate, authenticateAdmin } = require('../middleware/authenticate');

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL || 'http://localhost:3005/api/images';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005/api/notifications';

// Send a notification
const sendNotification = async (userId, issueId, message) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/send`, { userId, issueId, message }, {
      headers: { Authorization: `Bearer ${process.env.NOTIFICATION_SERVICE_TOKEN}` }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// Create a new issue
router.post('/issues', authenticate, async (req, res) => {
  const { description, location, area, city, photo } = req.body;
  let photoString = '';
  console.log(req.body)
  if (photo) {
    // try {
    //   const response = await axios.post(`${IMAGE_SERVICE_URL}/upload`, { image: photo }, {
    //     headers: { Authorization: req.header('Authorization'),
    //       'Content-Type': 'application/json',
    //      }
    //   });
      photoString = "imageID";
  }
  const status = "Open"
  const newIssue = new Issue({ description, location, area, city, photo: photoString, reporterId: req.user.username, status });
  await newIssue.save();
  res.status(201).send(newIssue);
});

// user route to fetch all issues
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.send(issues);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    res.status(500).send({ error: 'Failed to fetch issues' });
  }
});

// Fetch issues created by a specific user
router.get('/issues/user/:username', authenticate, async (req, res) => {
  const { username } = req.params;

  try {
    const issues = await Issue.find({ reporterId: username });
    res.send(issues);
  } catch (error) {
    console.error('Failed to fetch user issues:', error);
    res.status(500).send({ error: 'Failed to fetch user issues' });
  }
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
  console.log(req.user)

  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }
  console.log(issue.reporterId !== req.user.username )
  console.log(req.user.is_admin !== true)

  if (!(issue.reporterId === req.user.username || req.user.is_admin === true)) {
    return res.status(403).send({ error: 'Only the reporter or an admin can update the issue' });
  }

  issue.status = status;
  issue.updatedAt = Date.now();
  await issue.save();
  res.send(issue);
});

router.post('/issues/:id/highlight', authenticate, async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const issue = await Issue.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } }, // Use $inc for atomic increment
      { new: true } // Return the updated document
    );

    if (!issue) {
      return res.status(404).send({ error: 'Issue not found' });
    }

    // Send notification to the issue owner
    if (issue.reporterId.toString() !== req.user.username.toString()) {
      await sendNotification(issue.reporterId, issueId, `Your issue has been liked.`);
    }
    res.send({ upvotes: issue.upvotes });
  } catch (error) {
    console.error('Failed to highlight issue:', error);
    res.status(500).send({ error: 'Failed to highlight issue' });
  }
});


router.post('/issues/:id/remove-highlight', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).send({ error: 'Issue not found' });
    }

    issue.upvotes = Math.max((issue.upvotes || 0) - 1, 0); // Ensure upvotes don't go below zero
    await issue.save();

    res.send({ upvotes: issue.upvotes });
  } catch (error) {
    console.error('Failed to remove highlight from issue:', error);
    res.status(500).send({ error: 'Failed to remove highlight from issue' });
  }
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

  // Send notification to the issue owner
  if (issue.reporterId.toString() !== req.user.username.toString()) {
    await sendNotification(issue.reporterId, issueId, `New comment on your issue: ${text}`);
  }
});

// Remove a comment from an issue
router.delete('/issues/:id/comments/:commentId', authenticate, async (req, res) => {
  console.log(req.params);
  const { id, commentId } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).send({ error: 'Issue not found' });
  }

  const comment = issue.comments.id(commentId);
  if (!comment) {
    return res.status(404).send({ error: 'Comment not found' });
  }

  if (comment.userId !== req.user.username) {
    return res.status(403).send({ error: 'You can only delete your own comments' });
  }

  // Remove the comment
  issue.comments = issue.comments.filter(c => c.id !== commentId);
  issue.updatedAt = Date.now();
  
  await issue.save();
  res.send(issue);
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

// Route to get personal issue reports (for users)
router.get('/reports/personal', authenticate, async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const issues = await Issue.find({ reporterId: user.username });
    const completedIssues = issues.filter(issue => issue.status === 'Resolved').length;
    const pendingIssues = issues.filter(issue => issue.status !== 'Resolved').length;
    res.json({ totalIssues: issues.length, completedIssues, pendingIssues });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate personal reports' });
  }
});

module.exports = router;