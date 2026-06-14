const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const UserBadge = require('../models/UserBadge');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateProfileCompletion } = require('../services/profile.service');
const { aggregateUserSkills } = require('../services/skillExtraction.service');

const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('badges');
  res.json(user);
});

router.put('/profile', authenticate, async (req, res) => {
  const allowed = ['name', 'bio', 'avatar', 'skills', 'education', 'githubUsername', 'linkedinUrl'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  await calculateProfileCompletion(user._id);
  res.json(user);
});

router.get('/:id/portfolio', authenticate, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').populate('badges');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const [projects, certificates, userBadges] = await Promise.all([
    Project.find({ student: req.params.id }),
    Certificate.find({ student: req.params.id }),
    UserBadge.find({ user: req.params.id }).populate('badge'),
  ]);

  res.json({ user, projects, certificates, badges: userBadges });
});

router.get('/dashboard/stats', authenticate, async (req, res) => {
  const userId = req.user._id;
  const [projects, certificates, userBadges] = await Promise.all([
    Project.find({ student: userId }),
    Certificate.find({ student: userId }),
    UserBadge.find({ user: userId }).populate('badge'),
  ]);

  const stats = {
    totalProjects: projects.length,
    approvedProjects: projects.filter((p) => p.verificationStatus === 'approved').length,
    pendingProjects: projects.filter((p) => p.verificationStatus === 'pending').length,
    totalCertificates: certificates.length,
    approvedCertificates: certificates.filter((c) => c.verificationStatus === 'approved').length,
    pendingCertificates: certificates.filter((c) => c.verificationStatus === 'pending').length,
    badges: userBadges.length,
    profileCompletion: req.user.profileCompletion,
    skills: req.user.skills || [],
  };

  res.json(stats);
});

router.post('/skills/aggregate', authenticate, authorize('student'), async (req, res) => {
  const skills = await aggregateUserSkills(req.user._id);
  res.json({ skills });
});

module.exports = router;
