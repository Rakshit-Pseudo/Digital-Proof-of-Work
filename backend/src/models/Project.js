const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    techStack: { type: [String], required: true, default: [] },
    githubUrl: { type: String, trim: true, default: '' },
    files: { type: [fileSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
