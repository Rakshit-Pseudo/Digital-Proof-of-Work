const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Verification = require('../models/Verification');
const SavedCandidate = require('../models/SavedCandidate');
const AuditLog = require('../models/AuditLog');
const UserBadge = require('../models/UserBadge');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');

const router = express.Router();

router.get('/saved', authenticate, authorize('recruiter'), async (req, res) => {
  const saved = await SavedCandidate.find({ recruiter: req.user._id })
    .populate('student', 'name email avatar skills profileCompletion education')
    .sort({ createdAt: -1 });
  res.json(saved);
});

router.post('/saved', authenticate, authorize('recruiter'), async (req, res) => {
  const { studentId, notes, tags } = req.body;
  const saved = await SavedCandidate.findOneAndUpdate(
    { recruiter: req.user._id, student: studentId },
    { notes, tags },
    { upsert: true, new: true }
  ).populate('student', 'name email avatar skills');
  res.json(saved);
});

router.delete('/saved/:studentId', authenticate, authorize('recruiter'), async (req, res) => {
  await SavedCandidate.findOneAndDelete({ recruiter: req.user._id, student: req.params.studentId });
  res.json({ message: 'Candidate removed' });
});

router.get('/dashboard', authenticate, authorize('recruiter'), async (req, res) => {
  const [savedCount, totalStudents, verifiedStudents] = await Promise.all([
    SavedCandidate.countDocuments({ recruiter: req.user._id }),
    User.countDocuments({ role: 'student', isSuspended: false }),
    Project.distinct('student', { verificationStatus: 'approved' }).then((ids) => ids.length),
  ]);
  res.json({ savedCount, totalStudents, verifiedStudents });
});

module.exports = router;
