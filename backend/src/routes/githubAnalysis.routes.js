const express = require('express');
const GitHubAnalysis = require('../models/GitHubAnalysis');
const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');
const { analyzeRepository } = require('../services/githubAnalyzer.service');
const { checkAndAwardBadges } = require('../services/badge.service');
const { notifyBadgeEarned } = require('../services/notification.service');

const router = express.Router();

router.post('/analyze', authenticate, authorize('student'), async (req, res) => {
  const { repoUrl, projectId } = req.body;
  if (!repoUrl) return res.status(400).json({ message: 'Repository URL is required' });

  try {
    const analysis = await analyzeRepository(repoUrl, req.user._id, projectId);

    if (projectId) {
      await Project.findOneAndUpdate(
        { _id: projectId, student: req.user._id },
        {
          aiAnalysis: analysis._id,
          summary: analysis.summary,
          technologies: analysis.technologies,
          skills: analysis.skills,
          githubUrl: repoUrl,
        }
      );
    }

    const newBadges = await checkAndAwardBadges(req.user._id);
    for (const ub of newBadges) {
      await notifyBadgeEarned(req.user._id, ub.badge?.name, ub.reason);
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history', authenticate, async (req, res) => {
  const analyses = await GitHubAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(analyses);
});

router.get('/:id', authenticate, async (req, res) => {
  const analysis = await GitHubAnalysis.findOne({ _id: req.params.id, user: req.user._id });
  if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
  res.json(analysis);
});

module.exports = router;
