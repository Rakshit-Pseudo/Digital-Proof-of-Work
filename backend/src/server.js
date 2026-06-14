require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initSocket: initNotificationSocket } = require('./services/notification.service');
const { initSocket: setupSocketAuth } = require('./socket');
const { seedBadges } = require('./services/badge.service');
const { seedUsers } = require('./services/seeder.service');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const projectsRoutes = require('./routes/projects.routes');
const certificatesRoutes = require('./routes/certificates.routes');
const verificationsRoutes = require('./routes/verifications.routes');
const badgesRoutes = require('./routes/badges.routes');
const reportsRoutes = require('./routes/reports.routes');
const auditLogsRoutes = require('./routes/auditLogs.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const githubAnalysisRoutes = require('./routes/githubAnalysis.routes');
const searchRoutes = require('./routes/search.routes');
const recruiterRoutes = require('./routes/recruiter.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
});

connectDB();
initNotificationSocket(io);
setupSocketAuth(io);
seedBadges().then(() => seedUsers()).catch(console.error);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/verifications', verificationsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/github-analysis', githubAnalysisRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`DPOW API running on port ${PORT}`));

module.exports = { app, server, io };
