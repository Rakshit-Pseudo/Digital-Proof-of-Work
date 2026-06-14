const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { generateStudentReport } = require('../services/pdfReport.service');
const { logAction } = require('../middleware/auditLogger');

const router = express.Router();

router.get('/student/:studentId', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const pdfBuffer = await generateStudentReport(req.params.studentId);
    await logAction(req, 'download_report', 'user', req.params.studentId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="dpow-report-${req.params.studentId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
