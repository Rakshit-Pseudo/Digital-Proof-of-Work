const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const { uploadProjectFile, deleteByPublicId } = require('./cloudinary.service');

const createProject = async (userId, data, files = []) => {
  const uploadedFiles = await Promise.all(
    files.map((file) => uploadProjectFile(file))
  );

  const project = await Project.create({
    user: userId,
    title: data.title,
    description: data.description,
    techStack: data.techStack,
    githubUrl: data.githubUrl || '',
    files: uploadedFiles,
  });

  return project;
};

const getProjectsByUser = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [projects, total] = await Promise.all([
    Project.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments({ user: userId }),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProjectById = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  return project;
};

const updateProject = async (userId, id, data, files = []) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (project.user.toString() !== userId) {
    throw new ApiError(403, 'You can only update your own projects');
  }

  if (data.title !== undefined) project.title = data.title;
  if (data.description !== undefined) project.description = data.description;
  if (data.techStack !== undefined) project.techStack = data.techStack;
  if (data.githubUrl !== undefined) project.githubUrl = data.githubUrl;

  if (files.length > 0) {
    const uploadedFiles = await Promise.all(
      files.map((file) => uploadProjectFile(file))
    );
    project.files = [...project.files, ...uploadedFiles];
  }

  await project.save();
  return project;
};

const deleteProject = async (userId, id, isAdmin = false) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (!isAdmin && project.user.toString() !== userId) {
    throw new ApiError(403, 'You can only delete your own projects');
  }

  await Promise.all(
    project.files.map((f) => deleteByPublicId(f.publicId, f.mimeType?.startsWith('image/') ? 'image' : 'raw'))
  );

  await project.deleteOne();
  return { message: 'Project deleted successfully' };
};

module.exports = {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
};
