const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: String,
  startYear: Number,
  endYear: Number,
  current: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['student', 'verifier', 'recruiter', 'admin'],
      default: 'student',
    },
    avatar: String,
    bio: String,
    skills: [{ type: String, trim: true }],
    education: [educationSchema],
    githubUsername: String,
    linkedinUrl: String,
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    isSuspended: { type: Boolean, default: false },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', 'skills': 'text', bio: 'text' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
