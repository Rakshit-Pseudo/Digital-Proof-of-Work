const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Verification = require('../models/Verification');

const seedUsers = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Seeder: Default users already exist, skipping.');
      return;
    }

    console.log('Seeder: Bootstrapping default users...');

    // 1. Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      bio: 'DPOW Platform Administrator',
    });

    // 2. Create Verifier
    const verifier = await User.create({
      name: 'Dr. Jane Smith',
      email: 'verifier@example.com',
      password: 'password123',
      role: 'verifier',
      bio: 'Senior Technical Evaluator and Academic Verifier',
    });

    // 3. Create Recruiter
    const recruiter = await User.create({
      name: 'John Recruiter',
      email: 'recruiter@example.com',
      password: 'password123',
      role: 'recruiter',
      bio: 'Technical Talent Acquisition Specialist',
    });

    // 4. Create Student
    const student = await User.create({
      name: 'Alex Johnson',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
      bio: 'Full Stack Web Developer & Computer Science Student',
      skills: ['react', 'next.js', 'node.js', 'mongodb', 'typescript', 'tailwind css'],
      education: [
        {
          institution: 'State University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          current: true,
        }
      ],
      githubUsername: 'alexjohnson-dev',
      linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      profileCompletion: 80,
    });

    console.log('Seeder: Default users created successfully!');

    // 5. Create some seed Projects for the student
    const p1 = await Project.create({
      title: 'E-Commerce Microservices Platform',
      description: 'A scalable modular e-commerce architecture built with Node.js, Express, RabbitMQ, and MongoDB.',
      githubUrl: 'https://github.com/alexjohnson-dev/ecommerce-microservices',
      liveUrl: 'https://ecommerce-demo.alexjohnson.dev',
      technologies: ['node.js', 'express', 'mongodb', 'rabbitmq', 'docker'],
      skills: ['backend development', 'microservices', 'message queues', 'api design'],
      summary: 'A microservices-based e-commerce platform demonstrating distributed messaging and dockerization.',
      verificationStatus: 'approved',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      student: student._id,
    });

    const p2 = await Project.create({
      title: 'Real-Time Collaboration Dashboard',
      description: 'A dynamic multi-user real-time rich document collaboration dashboard utilizing WebSocket / Socket.io.',
      githubUrl: 'https://github.com/alexjohnson-dev/collab-dashboard',
      technologies: ['react', 'next.js', 'socket.io', 'redis', 'tailwind css'],
      skills: ['react', 'websockets', 'state management', 'real-time databases'],
      summary: 'A real-time rich document editor dashboard featuring multi-cursor editing and Redis caching.',
      verificationStatus: 'pending',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      student: student._id,
    });

    const p3 = await Project.create({
      title: 'AI Smart Resume Parser',
      description: 'An AI-powered application utilizing LLMs to automatically parse resumes, extract skills, and matching jobs.',
      githubUrl: 'https://github.com/alexjohnson-dev/resume-parser',
      technologies: ['next.js', 'openai', 'typescript', 'mongodb'],
      skills: ['artificial intelligence', 'large language models', 'data extraction'],
      verificationStatus: 'draft',
      student: student._id,
    });

    // 6. Create seed Certificates
    const c1 = await Certificate.create({
      title: 'Advanced React Certification',
      issuer: 'Frontend Masters',
      issueDate: '2025-10-15',
      verificationStatus: 'approved',
      student: student._id,
    });

    const c2 = await Certificate.create({
      title: 'MongoDB Certified Developer Associate',
      issuer: 'MongoDB Inc.',
      issueDate: '2026-02-20',
      verificationStatus: 'pending',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      student: student._id,
    });

    // 7. Seed badge awards
    const badgeVerified = await Badge.findOne({ name: 'Verified Developer' });
    if (badgeVerified) {
      await UserBadge.create({
        user: student._id,
        badge: badgeVerified._id,
        reason: 'First project verified',
      });
      await User.findByIdAndUpdate(student._id, { $addToSet: { badges: badgeVerified._id } });
    }

    const badgeLearner = await Badge.findOne({ name: 'Certified Learner' });
    if (badgeLearner) {
      await UserBadge.create({
        user: student._id,
        badge: badgeLearner._id,
        reason: 'First certificate verified',
      });
      await User.findByIdAndUpdate(student._id, { $addToSet: { badges: badgeLearner._id } });
    }

    // 8. Log initial verification history
    await Verification.create({
      submissionType: 'project',
      submissionId: p1._id,
      student: student._id,
      verifier: verifier._id,
      status: 'approved',
      feedback: 'Excellent clean microservices structure, great test coverage, and documentation.',
      reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await Verification.create({
      submissionType: 'certificate',
      submissionId: c1._id,
      student: student._id,
      verifier: verifier._id,
      status: 'approved',
      feedback: 'Legitimate Frontend Masters verification verified successfully.',
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    console.log('Seeder: Seed data populated successfully!');
  } catch (error) {
    console.error('Seeder: Error during seeding:', error.message);
  }
};

module.exports = { seedUsers };
