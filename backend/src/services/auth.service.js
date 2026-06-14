const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const {
  hashToken,
  generateRandomToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('./email.service');

const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFY_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_MS = 60 * 60 * 1000;

const hashPassword = async (password) =>
  bcrypt.hash(password, config.bcryptRounds);

const comparePassword = async (password, hash) =>
  bcrypt.compare(password, hash);

const issueTokens = async (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
  });

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt > new Date()
  );

  await user.save();

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const verificationToken = generateRandomToken();
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFY_MS),
  });

  await sendVerificationEmail(email, verificationToken);

  return user.toPublicJSON();
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
};

const resendVerification = async (email) => {
  const user = await User.findOne({ email }).select(
    '+emailVerificationToken +emailVerificationExpires'
  );

  if (!user) {
    return { message: 'If the account exists, a verification email has been sent' };
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  const verificationToken = generateRandomToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFY_MS);
  await user.save();

  await sendVerificationEmail(email, verificationToken);

  return { message: 'Verification email sent' };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');

  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  const tokens = await issueTokens(user);

  return {
    user: user.toPublicJSON(),
    ...tokens,
  };
};

const refresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const hashed = hashToken(refreshToken);
  const stored = user.refreshTokens.find((t) => t.token === hashed);

  if (!stored || stored.expiresAt < new Date()) {
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
    await user.save();
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
  const tokens = await issueTokens(user);

  return {
    user: user.toPublicJSON(),
    ...tokens,
  };
};

const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return { message: 'Logged out successfully' };

  const hashed = hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
  await user.save();

  return { message: 'Logged out successfully' };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email }).select(
    '+passwordResetToken +passwordResetExpires'
  );

  if (user) {
    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_MS);
    await user.save();
    await sendPasswordResetEmail(email, resetToken);
  }

  return { message: 'If the account exists, a reset email has been sent' };
};

const resetPassword = async (token, password) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +refreshTokens +password');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  return { message: 'Password reset successfully' };
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
