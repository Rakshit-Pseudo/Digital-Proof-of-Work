const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
  },
  { _id: true }
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    avatarUrl: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },
    education: { type: [educationSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    profileCompletionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

profileSchema.statics.calculateCompletion = function (profile) {
  const checks = [
    Boolean(profile.avatarUrl),
    Boolean(profile.headline?.trim()),
    Boolean(profile.bio?.trim()),
    profile.education?.length > 0,
    profile.skills?.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

module.exports = mongoose.model('Profile', profileSchema);
