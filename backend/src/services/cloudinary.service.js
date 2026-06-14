const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'dpow',
        resource_type: options.resourceType || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(new ApiError(500, 'File upload failed'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });

const deleteByPublicId = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Ignore cleanup failures
  }
};

const uploadAvatar = async (file) => {
  const result = await uploadBuffer(file.buffer, {
    folder: 'dpow/avatars',
    resource_type: 'image',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const uploadProjectFile = async (file) => {
  const isImage = file.mimetype.startsWith('image/');
  const result = await uploadBuffer(file.buffer, {
    folder: 'dpow/projects',
    resource_type: isImage ? 'image' : 'raw',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.originalname,
    mimeType: file.mimetype,
  };
};

const uploadCertificateFile = async (file) => {
  const isImage = file.mimetype.startsWith('image/');
  const result = await uploadBuffer(file.buffer, {
    folder: 'dpow/certificates',
    resource_type: isImage ? 'image' : 'raw',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.originalname,
    mimeType: file.mimetype,
  };
};

module.exports = {
  uploadBuffer,
  deleteByPublicId,
  uploadAvatar,
  uploadProjectFile,
  uploadCertificateFile,
};
