const express = require('express');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Verification = require('../models/Verification');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const { notifyVerificationResult } = require('../services/notification.service');
const { checkAndAwardBadges } = require('../services/badge.service');
const { notifyBadgeEarned } = require('../services/notification.service');
const { aggregateUserSkills } = require('../services/skillExtraction.service');

const router = express.Router();

const getSubmission = async (type, id) => {
  if (type === 'project') return Project.findById(id).populate('student', 'name email');
  if (type === 'certificate') return Certificate.findById(id).populate('student', 'name email');
  return null;
};

router.get('/pending', authenticate, authorize('verifier', 'admin'), async (req, res) => {
  const [projects, certificates] = await Promise.all([
    Project.find({ verificationStatus: 'pending' }).populate('student', 'name email avatar').sort({ submittedAt: 1 }),
    Certificate.find({ verificationStatus: 'pending' }).populate('student', 'name email avatar').sort({ submittedAt: 1 }),
  ]);

  const pending = [
    ...projects.map((p) => ({ type: 'project', submission: p })),
    ...certificates.map((c) => ({ type: 'certificate', submission: c })),
  ].sort((a, b) => new Date(a.submission.submittedAt) - new Date(b.submission.submittedAt));

  res.json(pending);
});

router.get('/history', authenticate, authorize('verifier', 'admin'), async (req, res) => {
  const filter = req.user.role === 'verifier' ? { verifier: req.user._id } : {};
  const { status, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [history, total] = await Promise.all([
    Verification.find(filter)
      .populate('student', 'name email')
      .populate('verifier', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Verification.countDocuments(filter),
  ]);

  res.json({ data: history, pagination: { page: Number(page), limit: Number(limit), total } });
});

router.get('/student/:studentId', authenticate, async (req, res) => {
  const history = await Verification.find({ student: req.params.studentId })
    .populate('verifier', 'name')
    .sort({ createdAt: -1 });
  res.json(history);
});

router.post('/:type/:id/review', authenticate, authorize('verifier', 'admin'), async (req, res) => {
  const { type, id } = req.params;
  const { status, feedback } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  const submission = await getSubmission(type, id);
  if (!submission) return res.status(404).json({ message: 'Submission not found' });
  if (submission.verificationStatus !== 'pending') {
    return res.status(400).json({ message: 'Submission is not pending' });
  }

  submission.verificationStatus = status;
  submission.verifiedAt = new Date();
  submission.verifiedBy = req.user._id;
  submission.feedback = feedback || '';
  await submission.save();

  const verification = await Verification.create({
    submissionType: type,
    submissionId: id,
    student: submission.student._id || submission.student,
    verifier: req.user._id,
    status,
    feedback,
  });

  await notifyVerificationResult(submission.student._id || submission.student, status, type, feedback);
  await logAction(req, `${status}_verification`, type, id, { feedback });

  if (status === 'approved') {
    await aggregateUserSkills(submission.student._id || submission.student);
    const newBadges = await checkAndAwardBadges(submission.student._id || submission.student);
    for (const ub of newBadges) {
      await notifyBadgeEarned(
        submission.student._id || submission.student,
        ub.badge?.name || 'Badge',
        ub.reason
      );
    }
  }

  res.json({ submission, verification });
});

router.get('/stats', authenticate, authorize('verifier', 'admin'), async (req, res) => {
  const verifierFilter = req.user.role === 'verifier' ? { verifier: req.user._id } : {};
  const [pending, approved, rejected] = await Promise.all([
    Project.countDocuments({ verificationStatus: 'pending' }) +
      (await Certificate.countDocuments({ verificationStatus: 'pending' })),
    Verification.countDocuments({ ...verifierFilter, status: 'approved' }),
    Verification.countDocuments({ ...verifierFilter, status: 'rejected' }),
  ]);

  res.json({ pending, approved, rejected });
});

module.exports = router;
