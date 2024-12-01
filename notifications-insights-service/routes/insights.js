const express = require('express');
const router = express.Router();
const axios = require('axios');

const ISSUES_SERVICE_URL = process.env.ISSUES_SERVICE_URL || 'http://localhost:3000/api';

// Fetch insights for a specific location
router.get('/insights', async (req, res) => {
  const { id, city, area } = req.query;
  let issues;

  try {
    if (id) {
      console.log(`Fetching issues by id: ${id}`);
      const response = await axios.get(`${ISSUES_SERVICE_URL}/issues`, { params: { id } });
      issues = response.data;
    } else if (city) {
      console.log(`Fetching issues by city: ${city}`);
      console.log(`${ISSUES_SERVICE_URL}/issues`, { params: { city } })
      const response = await axios.get(`${ISSUES_SERVICE_URL}/issues`, { params: { city } });
      issues = response.data;
      console.log(issues)
    } else if (area) {
      console.log(`Fetching issues by area: ${area}`);
      const response = await axios.get(`${ISSUES_SERVICE_URL}/issues`, { params: { area } });
      issues = response.data;
    } else {
      return res.status(400).send({ error: 'Please provide id, city, or area to fetch insights' });
    }

    const insights = {
      totalIssues: issues.length,
      openIssues: issues.filter(issue => issue.status === 'Open').length,
      resolvedIssues: issues.filter(issue => issue.status === 'Resolved').length,
      mostCommonIssueType: issues.reduce((acc, issue) => {
        acc[issue.description] = (acc[issue.description] || 0) + 1;
        return acc;
      }, {}),
      averageResolutionTime: issues.filter(issue => issue.status === 'Resolved').reduce((acc, issue) => {
        const resolutionTime = (new Date(issue.updatedAt) - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24); // in days
        return acc + resolutionTime;
      }, 0) / issues.filter(issue => issue.status === 'Resolved').length || 0,
    };

    res.send(insights);
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    res.status(500).send({ error: 'Failed to fetch insights' });
  }
});

module.exports = router;