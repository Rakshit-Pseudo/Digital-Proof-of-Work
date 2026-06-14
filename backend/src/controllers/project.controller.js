const projectService = require('../services/project.service');
const asyncHandler = require('../utils/asyncHandler');

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(
    req.user.id,
    req.body,
    req.files || []
  );
  res.status(201).json({ success: true, data: project });
});

const getProjectsByUser = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await projectService.getProjectsByUser(req.params.userId, page, limit);
  res.json({ success: true, data: result });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.json({ success: true, data: project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.user.id,
    req.params.id,
    req.body,
    req.files || []
  );
  res.json({ success: true, data: project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(
    req.user.id,
    req.params.id,
    req.user.role === 'admin'
  );
  res.json({ success: true, ...result });
});

module.exports = {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
};
