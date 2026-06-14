const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (config.smtp.host && config.smtp.user) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  const info = await transport.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });

  if (config.nodeEnv === 'development' && !config.smtp.user) {
    console.log('Email (dev mode):', JSON.stringify(info, null, 2));
  }

  return info;
};

const sendVerificationEmail = async (email, token) => {
  const url = `${config.frontendUrl}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your DPOW account',
    html: `<p>Click the link below to verify your email:</p><p><a href="${url}">${url}</a></p>`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${config.frontendUrl}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your DPOW password',
    html: `<p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${url}">${url}</a></p>`,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
