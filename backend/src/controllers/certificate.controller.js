const certificateService = require('../services/certificate.service');
const asyncHandler = require('../utils/asyncHandler');

const createCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.createCertificate(
    req.user.id,
    req.body,
    req.file
  );
  res.status(201).json({ success: true, data: certificate });
});

const getCertificatesByUser = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getCertificatesByUser(req.params.userId);
  res.json({ success: true, data: certificates });
});

const deleteCertificate = asyncHandler(async (req, res) => {
  const result = await certificateService.deleteCertificate(
    req.user.id,
    req.params.id,
    req.user.role === 'admin'
  );
  res.json({ success: true, ...result });
});

module.exports = {
  createCertificate,
  getCertificatesByUser,
  deleteCertificate,
};
