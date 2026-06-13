const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Verification = require('../models/Verification');
const AuditLog = require('../models/AuditLog');
const UserBadge = require('../models/UserBadge');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');

const router = express.Router();

router.get('/analytics', authenticate, authorize('admin'), async (req, res) => {
  const [
    totalUsers,
    students,
    verifiers,
    recruiters,
    admins,
    suspended,
    totalProjects,
    approvedProjects,
    pendingProjects,
    totalCertificates,
    approvedCertificates,
    totalVerifications,
    totalBadges,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'verifier' }),
    User.countDocuments({ role: 'recruiter' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isSuspended: true }),
    Project.countDocuments(),
    Project.countDocuments({ verificationStatus: 'approved' }),
    Project.countDocuments({ verificationStatus: 'pending' }),
    Certificate.countDocuments(),
    Certificate.countDocuments({ verificationStatus: 'approved' }),
    Verification.countDocuments(),
    UserBadge.countDocuments(),
    AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name'),
  ]);

  res.json({
    users: { total: totalUsers, students, verifiers, recruiters, admins, suspended },
    projects: { total: totalProjects, approved: approvedProjects, pending: pendingProjects },
    certificates: { total: totalCertificates, approved: approvedCertificates },
    verifications: totalVerifications,
    badgesAwarded: totalBadges,
    recentActivity: recentLogs,
  });
});

router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ data: users, pagination: { page: Number(page), limit: Number(limit), total } });
});

router.get('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').populate('badges');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.post('/users', authenticate, authorize('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const user = await User.create({ name, email, password, role, assignedBy: req.user._id });
  await logAction(req, 'create_user', 'user', user._id, { role });
  res.status(201).json(user);
});

router.put('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  const allowed = ['name', 'email', 'role', 'bio', 'skills'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  await logAction(req, 'update_user', 'user', user._id, updates);
  res.json(user);
});

router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await logAction(req, 'delete_user', 'user', req.params.id);
  res.json({ message: 'User deleted' });
});

router.patch('/users/:id/suspend', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isSuspended: req.body.suspended ?? true },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });
  await logAction(req, user.isSuspended ? 'suspend_user' : 'unsuspend_user', 'user', user._id);
  res.json(user);
});

router.post('/users/:id/assign-verifier', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: 'verifier', assignedBy: req.user._id },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });
  await logAction(req, 'assign_verifier', 'user', user._id);
  res.json(user);
});

router.post('/users/:id/assign-recruiter', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: 'recruiter', assignedBy: req.user._id },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });
  await logAction(req, 'assign_recruiter', 'user', user._id);
  res.json(user);
});

router.get('/analytics/timeseries', authenticate, authorize('admin'), async (req, res) => {
  const days = Number(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [userSignups, projectSubmissions] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Project.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Fill in missing dates with 0
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const signups = userSignups.find((u) => u._id === dateStr)?.count || 0;
    const projects = projectSubmissions.find((p) => p._id === dateStr)?.count || 0;
    result.push({ date: dateStr, signups, projects });
  }

  res.json(result);
});

module.exports = router;

