const express = require('express');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 50, action, userId } = req.query;
  const filter = {};
  if (action) filter.action = new RegExp(action, 'i');
  if (userId) filter.user = userId;

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);

  res.json({ data: logs, pagination: { page: Number(page), limit: Number(limit), total } });
});

module.exports = router;
