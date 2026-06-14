const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');
const { uploadAvatar, deleteByPublicId } = require('./cloudinary.service');

const recalculateCompletion = (profile) => {
  profile.profileCompletionPercentage = Profile.calculateCompletion(profile);
  return profile;
};

const getMyProfile = async (userId) => {
  const profile = await Profile.findOne({ user: userId }).populate('user', 'name email role');
  if (!profile) {
    throw new ApiError(404, 'Profile not found');
  }
  return profile;
};

const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({ user: userId }).populate('user', 'name email role');
  if (!profile) {
    throw new ApiError(404, 'Profile not found');
  }
  return profile;
};

const createProfile = async (userId, data) => {
  const existing = await Profile.findOne({ user: userId });
  if (existing) {
    throw new ApiError(409, 'Profile already exists');
  }

  const profile = await Profile.create({
    user: userId,
    headline: data.headline,
    bio: data.bio,
    education: data.education || [],
    skills: data.skills || [],
  });

  recalculateCompletion(profile);
  await profile.save();
  return profile;
};

const updateProfile = async (userId, data) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, 'Profile not found. Create a profile first.');
  }

  if (data.headline !== undefined) profile.headline = data.headline;
  if (data.bio !== undefined) profile.bio = data.bio;
  if (data.education !== undefined) profile.education = data.education;
  if (data.skills !== undefined) profile.skills = data.skills;

  recalculateCompletion(profile);
  await profile.save();
  return profile;
};

const uploadProfileAvatar = async (userId, file) => {
  let profile = await Profile.findOne({ user: userId });

  if (!profile) {
    profile = await Profile.create({
      user: userId,
      headline: '',
      bio: '',
    });
  }

  if (profile.avatarPublicId) {
    await deleteByPublicId(profile.avatarPublicId);
  }

  const uploaded = await uploadAvatar(file);
  profile.avatarUrl = uploaded.url;
  profile.avatarPublicId = uploaded.publicId;
  recalculateCompletion(profile);
  await profile.save();

  return profile;
};

module.exports = {
  getMyProfile,
  getProfileByUserId,
  createProfile,
  updateProfile,
  uploadProfileAvatar,
};
