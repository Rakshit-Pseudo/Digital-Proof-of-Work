const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const UserBadge = require('../models/UserBadge');

const buildSearchQuery = (filters) => {
  const query = { role: 'student', isSuspended: { $ne: true } };

  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  if (filters.skills) {
    const skills = Array.isArray(filters.skills) ? filters.skills : filters.skills.split(',');
    query.skills = { $in: skills.map((s) => new RegExp(s.trim(), 'i')) };
  }

  if (filters.education) {
    query['education.institution'] = new RegExp(filters.education, 'i');
  }

  if (filters.verificationStatus) {
    // handled via aggregation for project/cert status
  }

  if (filters.minProfileCompletion) {
    query.profileCompletion = { $gte: Number(filters.minProfileCompletion) };
  }

  return query;
};

const searchStudents = async (filters = {}) => {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const query = buildSearchQuery(filters);
  const sortField = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  if (filters.q) sort.score = { $meta: 'textScore' };

  let students = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  if (filters.badges) {
    const badgeIds = Array.isArray(filters.badges) ? filters.badges : filters.badges.split(',');
    const userIdsWithBadges = await UserBadge.find({ badge: { $in: badgeIds } }).distinct('user');
    students = students.filter((s) => userIdsWithBadges.some((id) => id.toString() === s._id.toString()));
  }

  if (filters.verificationStatus) {
    const status = filters.verificationStatus;
    const verifiedStudentIds = await Project.find({ verificationStatus: status }).distinct('student');
    students = students.filter((s) => verifiedStudentIds.some((id) => id.toString() === s._id.toString()));
  }

  const total = await User.countDocuments(query);

  const enriched = await Promise.all(
    students.map(async (student) => {
      const [projectCount, approvedProjects, certCount, badges] = await Promise.all([
        Project.countDocuments({ student: student._id }),
        Project.countDocuments({ student: student._id, verificationStatus: 'approved' }),
        Certificate.countDocuments({ student: student._id, verificationStatus: 'approved' }),
        UserBadge.find({ user: student._id }).populate('badge', 'name icon'),
      ]);
      return {
        ...student,
        stats: { projectCount, approvedProjects, certCount, badgeCount: badges.length },
        badges: badges.map((b) => b.badge),
      };
    })
  );

  return {
    data: enriched,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

module.exports = { searchStudents, buildSearchQuery };
