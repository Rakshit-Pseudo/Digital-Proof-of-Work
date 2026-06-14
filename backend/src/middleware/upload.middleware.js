const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const createUpload = (options = {}) => {
  const upload = multer({
    storage,
    limits: { fileSize: options.maxSize || 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (options.allowedMimes && !options.allowedMimes.includes(file.mimetype)) {
        return cb(new ApiError(422, `Unsupported file type: ${file.mimetype}`));
      }
      cb(null, true);
    },
  });

  return upload;
};

const avatarUpload = createUpload({
  maxSize: 2 * 1024 * 1024,
  allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
}).single('avatar');

const projectUpload = createUpload({
  maxSize: 10 * 1024 * 1024,
  allowedMimes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
}).array('files', 5);

const certificateUpload = createUpload({
  maxSize: 5 * 1024 * 1024,
  allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
}).single('file');

const handleMulterError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(422, 'File size exceeds the allowed limit'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new ApiError(422, 'Too many files uploaded'));
      }
      return next(new ApiError(422, err.message));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = {
  handleAvatarUpload: handleMulterError(avatarUpload),
  handleProjectUpload: handleMulterError(projectUpload),
  handleCertificateUpload: handleMulterError(certificateUpload),
};
