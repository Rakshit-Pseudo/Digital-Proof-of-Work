const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { chatCompletion, parseJSON } = require('./openai.service');

const DEFAULT_BADGES = [
  { name: 'First Project', description: 'Submitted first project', icon: '🚀', category: 'activity', criteria: '1 project submitted' },
  { name: 'Verified Developer', description: 'First project verified', icon: '✅', category: 'verification', criteria: '1 approved project' },
  { name: 'Certified Learner', description: 'First certificate verified', icon: '📜', category: 'verification', criteria: '1 approved certificate' },
  { name: 'Portfolio Pro', description: '5+ verified projects', icon: '💼', category: 'achievement', criteria: '5 approved projects' },
  { name: 'Skill Master', description: '10+ skills in profile', icon: '⚡', category: 'skill', criteria: '10 skills' },
  { name: 'Complete Profile', description: '100% profile completion', icon: '🎯', category: 'achievement', criteria: '100% profile' },
  { name: 'GitHub Explorer', description: 'Analyzed a GitHub repo', icon: '🐙', category: 'activity', criteria: 'GitHub analysis' },
  { name: 'Multi-Certified', description: '3+ verified certificates', icon: '🏅', category: 'achievement', criteria: '3 approved certificates' },
];

const seedBadges = async () => {
  for (const badge of DEFAULT_BADGES) {
    await Badge.findOneAndUpdate({ name: badge.name }, badge, { upsert: true });
  }
};

const awardBadge = async (userId, badgeName, reason, suggestedByAI = false) => {
  const badge = await Badge.findOne({ name: badgeName });
  if (!badge) return null;

  const existing = await UserBadge.findOne({ user: userId, badge: badge._id });
  if (existing) return null;

  const userBadge = await UserBadge.create({
    user: userId,
    badge: badge._id,
    reason,
    suggestedByAI,
  });

  await User.findByIdAndUpdate(userId, { $addToSet: { badges: badge._id } });
  return userBadge.populate('badge');
};

const checkAndAwardBadges = async (userId) => {
  const [projectCount, certCount, user, analysisCount] = await Promise.all([
    Project.countDocuments({ student: userId, verificationStatus: 'approved' }),
    Certificate.countDocuments({ student: userId, verificationStatus: 'approved' }),
    User.findById(userId),
    require('../models/GitHubAnalysis').countDocuments({ user: userId }),
  ]);

  const totalProjects = await Project.countDocuments({ student: userId });
  const awarded = [];

  const checks = [
    { condition: totalProjects >= 1, badge: 'First Project', reason: 'Submitted your first project' },
    { condition: projectCount >= 1, badge: 'Verified Developer', reason: 'First project verified' },
    { condition: certCount >= 1, badge: 'Certified Learner', reason: 'First certificate verified' },
    { condition: projectCount >= 5, badge: 'Portfolio Pro', reason: '5+ verified projects' },
    { condition: (user?.skills?.length || 0) >= 10, badge: 'Skill Master', reason: '10+ skills in profile' },
    { condition: user?.profileCompletion >= 100, badge: 'Complete Profile', reason: 'Profile 100% complete' },
    { condition: analysisCount >= 1, badge: 'GitHub Explorer', reason: 'Analyzed a GitHub repository' },
    { condition: certCount >= 3, badge: 'Multi-Certified', reason: '3+ verified certificates' },
  ];

  for (const check of checks) {
    if (check.condition) {
      const result = await awardBadge(userId, check.badge, check.reason);
      if (result) awarded.push(result);
    }
  }

  return awarded;
};

const suggestBadges = async (userId) => {
  const user = await User.findById(userId).populate('badges');
  const projects = await Project.find({ student: userId });
  const certificates = await Certificate.find({ student: userId });
  const existingBadges = (user?.badges || []).map((b) => b.name);
  const allBadges = await Badge.find();

  const systemPrompt = 'Suggest badges for a student based on activity. Return JSON: { "suggestions": [{ "badgeName": "...", "reason": "..." }] }';
  const userPrompt = `User: ${user?.name}, Skills: ${(user?.skills || []).join(', ')}
Projects: ${projects.length} (${projects.filter((p) => p.verificationStatus === 'approved').length} verified)
Certificates: ${certificates.length}
Existing badges: ${existingBadges.join(', ')}
Available badges: ${allBadges.map((b) => b.name).join(', ')}`;

  try {
    const response = await chatCompletion(systemPrompt, userPrompt, { json: true });
    const parsed = parseJSON(response);
    return (parsed.suggestions || []).filter((s) => !existingBadges.includes(s.badgeName));
  } catch {
    return [];
  }
};

module.exports = { seedBadges, awardBadge, checkAndAwardBadges, suggestBadges, DEFAULT_BADGES };
