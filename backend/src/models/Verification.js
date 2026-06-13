const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    submissionType: { type: String, enum: ['project', 'certificate'], required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'submissionType' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
    feedback: String,
    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

verificationSchema.index({ student: 1, status: 1 });
verificationSchema.index({ verifier: 1, status: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
