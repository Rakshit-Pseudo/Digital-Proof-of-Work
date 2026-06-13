const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Project = require('../models/Project');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateProfileCompletion } = require('../services/profile.service');
const { generateProjectSummary } = require('../services/githubAnalyzer.service');
const { detectTechnologies, extractProjectSkills } = require('../services/skillExtraction.service');
const { notifySubmissionReceived } = require('../services/notification.service');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', authenticate, async (req, res) => {
  const filter = req.user.role === 'student' ? { student: req.user._id } : {};
  const projects = await Project.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
  res.json(projects);
});

router.get('/:id', authenticate, async (req, res) => {
  const project = await Project.findById(req.params.id).populate('student', 'name email');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

router.post('/', authenticate, authorize('student'), async (req, res) => {
  const project = await Project.create({ ...req.body, student: req.user._id });
  await calculateProfileCompletion(req.user._id);
  res.status(201).json(project);
});

router.put('/:id', authenticate, authorize('student'), async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (project.verificationStatus === 'approved') {
    return res.status(400).json({ message: 'Cannot edit approved project' });
  }

  Object.assign(project, req.body);
  await project.save();
  res.json(project);
});

router.delete('/:id', authenticate, authorize('student'), async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, student: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ message: 'Project deleted' });
});

router.post('/:id/submit', authenticate, authorize('student'), async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });

  project.verificationStatus = 'pending';
  project.submittedAt = new Date();
  await project.save();

  const verifiers = await User.find({ role: 'verifier', isSuspended: false }).select('_id');
  await notifySubmissionReceived(
    verifiers.map((v) => v._id),
    req.user.name,
    'project',
    project._id
  );

  res.json(project);
});

router.post('/:id/analyze', authenticate, authorize('student'), async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
  if (!project) return res.status(404).json({ message: 'Project not found' });

  try {
    if (project.githubUrl) {
      const { analyzeRepository } = require('../services/githubAnalyzer.service');
      const analysis = await analyzeRepository(project.githubUrl, req.user._id, project._id);
      project.aiAnalysis = analysis._id;
      project.summary = analysis.summary;
      project.technologies = analysis.technologies;
      project.skills = analysis.skills;
    } else {
      project.summary = await generateProjectSummary(project);
      project.technologies = await detectTechnologies(project.description, project.technologies || []);
      project.skills = await extractProjectSkills(project._id);
    }
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dpow/projects' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  res.json({ url: result.secure_url });
});

module.exports = router;
