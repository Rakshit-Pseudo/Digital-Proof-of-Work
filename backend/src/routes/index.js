const express = require('express');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');
const projectRoutes = require('./project.routes');
const certificateRoutes = require('./certificate.routes');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
});

router.use(apiLimiter);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/certificates', certificateRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'DPOW API is running' });
});

module.exports = router;
