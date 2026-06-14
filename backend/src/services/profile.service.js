const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const { notifyProfileCompletion } = require('./notification.service');

const calculateProfileCompletion = async (userId) => {
  const [user, projectCount, certCount] = await Promise.all([
    User.findById(userId),
    Project.countDocuments({ student: userId }),
    Certificate.countDocuments({ student: userId }),
  ]);

  if (!user) return 0;

  let score = 0;
  const weights = {
    name: 5,
    bio: 10,
    avatar: 10,
    skills: 15,
    education: 15,
    github: 10,
    linkedin: 5,
    project: 15,
    certificate: 15,
  };

  if (user.name) score += weights.name;
  if (user.bio) score += weights.bio;
  if (user.avatar) score += weights.avatar;
  if (user.skills?.length >= 3) score += weights.skills;
  if (user.education?.length >= 1) score += weights.education;
  if (user.githubUsername) score += weights.github;
  if (user.linkedinUrl) score += weights.linkedin;
  if (projectCount >= 1) score += weights.project;
  if (certCount >= 1) score += weights.certificate;

  const previous = user.profileCompletion;
  if (previous !== score) {
    await User.findByIdAndUpdate(userId, { profileCompletion: score });
    if (score > previous) {
      await notifyProfileCompletion(userId, score);
    }
  }

  return score;
};

module.exports = { calculateProfileCompletion };
