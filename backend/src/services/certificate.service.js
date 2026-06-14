const Certificate = require('../models/Certificate');
const ApiError = require('../utils/ApiError');
const { uploadCertificateFile, deleteByPublicId } = require('./cloudinary.service');

const createCertificate = async (userId, data, file) => {
  if (!file) {
    throw new ApiError(422, 'Certificate file is required');
  }

  const uploaded = await uploadCertificateFile(file);

  const certificate = await Certificate.create({
    user: userId,
    title: data.title,
    issuingOrganization: data.issuingOrganization,
    issueDate: data.issueDate,
    expiryDate: data.expiryDate,
    file: uploaded,
  });

  return certificate;
};

const getCertificatesByUser = async (userId) => {
  return Certificate.find({ user: userId }).sort({ issueDate: -1 });
};

const deleteCertificate = async (userId, id, isAdmin = false) => {
  const certificate = await Certificate.findById(id);
  if (!certificate) {
    throw new ApiError(404, 'Certificate not found');
  }

  if (!isAdmin && certificate.user.toString() !== userId) {
    throw new ApiError(403, 'You can only delete your own certificates');
  }

  const resourceType = certificate.file.mimeType?.startsWith('image/') ? 'image' : 'raw';
  await deleteByPublicId(certificate.file.publicId, resourceType);
  await certificate.deleteOne();

  return { message: 'Certificate deleted successfully' };
};

module.exports = {
  createCertificate,
  getCertificatesByUser,
  deleteCertificate,
};
