const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    icon: { type: String, default: '🏆' },
    category: {
      type: String,
      enum: ['skill', 'achievement', 'verification', 'activity'],
      default: 'achievement',
    },
    criteria: String,
    color: { type: String, default: '#6366f1' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
