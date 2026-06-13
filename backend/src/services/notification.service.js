const Notification = require('../models/Notification');

let io = null;

const initSocket = (socketIo) => {
  io = socketIo;
};

const createNotification = async (recipientId, type, title, message, data = {}) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    data,
  });

  if (io) {
    io.to(`user:${recipientId}`).emit('notification', notification);
  }

  return notification;
};

const notifySubmissionReceived = async (verifierIds, studentName, submissionType, submissionId) => {
  const promises = verifierIds.map((id) =>
    createNotification(
      id,
      'submission_received',
      'New Submission',
      `${studentName} submitted a ${submissionType} for verification`,
      { submissionType, submissionId }
    )
  );
  return Promise.all(promises);
};

const notifyVerificationResult = async (studentId, status, submissionType, feedback) => {
  const type = status === 'approved' ? 'verification_approved' : 'verification_rejected';
  const title = status === 'approved' ? 'Verification Approved' : 'Verification Rejected';
  return createNotification(
    studentId,
    type,
    title,
    `Your ${submissionType} has been ${status}${feedback ? `: ${feedback}` : ''}`,
    { status, submissionType, feedback }
  );
};

const notifyBadgeEarned = async (userId, badgeName, reason) => {
  return createNotification(
    userId,
    'badge_earned',
    'Badge Earned!',
    `You earned the "${badgeName}" badge: ${reason}`,
    { badgeName, reason }
  );
};

const notifyProfileCompletion = async (userId, percentage) => {
  return createNotification(
    userId,
    'profile_completion',
    'Profile Updated',
    `Your profile is now ${percentage}% complete`,
    { percentage }
  );
};

module.exports = {
  initSocket,
  createNotification,
  notifySubmissionReceived,
  notifyVerificationResult,
  notifyBadgeEarned,
  notifyProfileCompletion,
};
