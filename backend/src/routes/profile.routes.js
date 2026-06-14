const express = require('express');
const profileController = require('../controllers/profile.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { handleAvatarUpload } = require('../middleware/upload.middleware');
const {
  createProfileSchema,
  updateProfileSchema,
  userIdParamSchema,
} = require('../validators/profile.validator');

const router = express.Router();

router.use(authenticate);

router.get('/me', profileController.getMyProfile);
router.post('/', authorize('student'), validate(createProfileSchema), profileController.createProfile);
router.patch('/me', authorize('student'), validate(updateProfileSchema), profileController.updateProfile);
router.post('/me/avatar', authorize('student'), handleAvatarUpload, profileController.uploadAvatar);
router.get('/:userId', validate(userIdParamSchema), profileController.getProfileByUserId);

module.exports = router;
