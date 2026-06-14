const express = require('express');
const certificateController = require('../controllers/certificate.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { handleCertificateUpload } = require('../middleware/upload.middleware');
const {
  createCertificateSchema,
  certificateIdSchema,
  userCertificatesSchema,
} = require('../validators/certificate.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('student'), handleCertificateUpload, validate(createCertificateSchema), certificateController.createCertificate);
router.get('/user/:userId', validate(userCertificatesSchema), certificateController.getCertificatesByUser);
router.delete('/:id', authorize('student'), validate(certificateIdSchema), certificateController.deleteCertificate);

module.exports = router;
