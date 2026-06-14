const express = require('express');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const { authenticate, authorize } = require('../middleware/auth');
const { checkAndAwardBadges, suggestBadges, seedBadges } = require('../services/badge.service');
const { notifyBadgeEarned } = require('../services/notification.service');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const badges = await Badge.find().sort({ category: 1, name: 1 });
  res.json(badges);
});

router.get('/my', authenticate, async (req, res) => {
  const userBadges = await UserBadge.find({ user: req.user._id })
    .populate('badge')
    .sort({ awardedAt: -1 });
  res.json(userBadges);
});

router.get('/user/:userId', authenticate, async (req, res) => {
  const userBadges = await UserBadge.find({ user: req.params.userId })
    .populate('badge')
    .sort({ awardedAt: -1 });
  res.json(userBadges);
});

router.get('/suggestions', authenticate, authorize('student'), async (req, res) => {
  const suggestions = await suggestBadges(req.user._id);
  res.json(suggestions);
});

router.post('/check', authenticate, authorize('student'), async (req, res) => {
  const awarded = await checkAndAwardBadges(req.user._id);
  for (const ub of awarded) {
    await notifyBadgeEarned(req.user._id, ub.badge?.name, ub.reason);
  }
  res.json({ awarded });
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const badge = await Badge.create(req.body);
  res.status(201).json(badge);
});

router.post('/seed', authenticate, authorize('admin'), async (req, res) => {
  await seedBadges();
  const badges = await Badge.find();
  res.json({ message: 'Badges seeded', count: badges.length });
});

router.post('/award', authenticate, authorize('admin'), async (req, res) => {
  const { userId, badgeName, reason } = req.body;
  const { awardBadge } = require('../services/badge.service');
  const result = await awardBadge(userId, badgeName, reason);
  if (!result) return res.status(400).json({ message: 'Badge already awarded or not found' });
  await notifyBadgeEarned(userId, badgeName, reason);
  res.json(result);
});

module.exports = router;
