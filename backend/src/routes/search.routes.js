const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { searchStudents } = require('../services/search.service');

const router = express.Router();

router.get('/students', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  const results = await searchStudents(req.query);
  res.json(results);
});

module.exports = router;
