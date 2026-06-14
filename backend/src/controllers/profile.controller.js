const profileService = require('../services/profile.service');
const asyncHandler = require('../utils/asyncHandler');

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getMyProfile(req.user.id);
  res.json({ success: true, data: profile });
});

const getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfileByUserId(req.params.userId);
  res.json({ success: true, data: profile });
});

const createProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.createProfile(req.user.id, req.body);
  res.status(201).json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: profile });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(422).json({ success: false, message: 'Avatar file is required' });
  }
  const profile = await profileService.uploadProfileAvatar(req.user.id, req.file);
  res.json({ success: true, data: profile });
});

module.exports = {
  getMyProfile,
  getProfileByUserId,
  createProfile,
  updateProfile,
  uploadAvatar,
};
