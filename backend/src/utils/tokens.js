const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);

const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

module.exports = {
  hashToken,
  generateRandomToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
