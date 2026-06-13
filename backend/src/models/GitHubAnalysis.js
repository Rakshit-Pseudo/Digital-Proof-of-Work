const mongoose = require('mongoose');

const githubAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    repoUrl: { type: String, required: true },
    repoName: String,
    summary: String,
    technologies: [String],
    skills: [String],
    complexity: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    highlights: [String],
    rawAnalysis: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('GitHubAnalysis', githubAnalysisSchema);
