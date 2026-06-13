const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateProfileCompletion } = require('../services/profile.service');
const { extractCertificateSkills } = require('../services/skillExtraction.service');
const { notifySubmissionReceived } = require('../services/notification.service');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', authenticate, async (req, res) => {
  const filter = req.user.role === 'student' ? { student: req.user._id } : {};
  const certificates = await Certificate.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
  res.json(certificates);
});

router.get('/:id', authenticate, async (req, res) => {
  const cert = await Certificate.findById(req.params.id).populate('student', 'name email');
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });
  res.json(cert);
});

router.post('/', authenticate, authorize('student'), async (req, res) => {
  const cert = await Certificate.create({ ...req.body, student: req.user._id });
  await calculateProfileCompletion(req.user._id);
  res.status(201).json(cert);
});

router.put('/:id', authenticate, authorize('student'), async (req, res) => {
  const cert = await Certificate.findOne({ _id: req.params.id, student: req.user._id });
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });
  if (cert.verificationStatus === 'approved') {
    return res.status(400).json({ message: 'Cannot edit approved certificate' });
  }

  Object.assign(cert, req.body);
  await cert.save();
  res.json(cert);
});

router.delete('/:id', authenticate, authorize('student'), async (req, res) => {
  const cert = await Certificate.findOneAndDelete({ _id: req.params.id, student: req.user._id });
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });
  res.json({ message: 'Certificate deleted' });
});

router.post('/:id/submit', authenticate, authorize('student'), async (req, res) => {
  const cert = await Certificate.findOne({ _id: req.params.id, student: req.user._id });
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });

  cert.verificationStatus = 'pending';
  cert.submittedAt = new Date();
  await cert.save();

  try {
    await extractCertificateSkills(cert._id);
  } catch {
    // non-blocking
  }

  const verifiers = await User.find({ role: 'verifier', isSuspended: false }).select('_id');
  await notifySubmissionReceived(
    verifiers.map((v) => v._id),
    req.user.name,
    'certificate',
    cert._id
  );

  res.json(cert);
});

router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dpow/certificates', resource_type: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  res.json({ url: result.secure_url });
});

module.exports = router;
