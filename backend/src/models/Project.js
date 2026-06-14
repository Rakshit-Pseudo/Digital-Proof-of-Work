const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    githubUrl: String,
    liveUrl: String,
    technologies: [{ type: String }],
    skills: [{ type: String }],
    summary: String,
    aiAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: 'GitHubAnalysis' },
    images: [String],
    verificationStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    submittedAt: Date,
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    feedback: String,
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

module.exports = mongoose.model('Project', projectSchema);
