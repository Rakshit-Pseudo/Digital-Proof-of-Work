const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, resource, resourceId, details = {}) => {
  try {
    if (!req.user) return;
    await AuditLog.create({
      user: req.user._id,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = { logAction };
