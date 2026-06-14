const express = require('express');
const projectController = require('../controllers/project.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { handleProjectUpload } = require('../middleware/upload.middleware');
const {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  userProjectsSchema,
} = require('../validators/project.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('student'), handleProjectUpload, validate(createProjectSchema), projectController.createProject);
router.get('/user/:userId', validate(userProjectsSchema), projectController.getProjectsByUser);
router.get('/:id', validate(projectIdSchema), projectController.getProjectById);
router.patch('/:id', authorize('student'), handleProjectUpload, validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', authorize('student'), validate(projectIdSchema), projectController.deleteProject);

module.exports = router;
