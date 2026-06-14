const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Verification = require('../models/Verification');
const UserBadge = require('../models/UserBadge');

const generateStudentReport = async (studentId) => {
  const [user, projects, certificates, verifications, userBadges] = await Promise.all([
    User.findById(studentId).select('-password'),
    Project.find({ student: studentId }).sort({ createdAt: -1 }),
    Certificate.find({ student: studentId }).sort({ issueDate: -1 }),
    Verification.find({ student: studentId }).populate('verifier', 'name').sort({ createdAt: -1 }),
    UserBadge.find({ user: studentId }).populate('badge'),
  ]);

  if (!user) throw new Error('Student not found');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#1e1b4b').text('Digital Proof of Work Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(16).fillColor('#1e1b4b').text('Profile');
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#334155');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    if (user.bio) doc.text(`Bio: ${user.bio}`);
    doc.text(`Profile Completion: ${user.profileCompletion}%`);
    if (user.skills?.length) doc.text(`Skills: ${user.skills.join(', ')}`);
    doc.moveDown(1);

    if (user.education?.length) {
      doc.fontSize(16).fillColor('#1e1b4b').text('Education');
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#334155');
      user.education.forEach((edu) => {
        doc.text(`${edu.degree} in ${edu.field || 'N/A'} — ${edu.institution} (${edu.startYear || ''}-${edu.endYear || 'Present'})`);
      });
      doc.moveDown(1);
    }

    doc.fontSize(16).fillColor('#1e1b4b').text(`Projects (${projects.length})`);
    doc.moveDown(0.3);
    projects.forEach((p) => {
      doc.fontSize(12).fillColor('#4338ca').text(p.title);
      doc.fontSize(10).fillColor('#64748b').text(`Status: ${p.verificationStatus}`);
      if (p.summary) doc.fontSize(10).fillColor('#334155').text(p.summary);
      if (p.technologies?.length) doc.fontSize(10).text(`Tech: ${p.technologies.join(', ')}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(0.5);

    doc.fontSize(16).fillColor('#1e1b4b').text(`Certificates (${certificates.length})`);
    doc.moveDown(0.3);
    certificates.forEach((c) => {
      doc.fontSize(12).fillColor('#4338ca').text(c.title);
      doc.fontSize(10).fillColor('#64748b').text(`${c.issuer} — ${c.verificationStatus}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(0.5);

    if (userBadges.length) {
      doc.fontSize(16).fillColor('#1e1b4b').text('Badges');
      doc.moveDown(0.3);
      userBadges.forEach((ub) => {
        doc.fontSize(11).fillColor('#334155').text(`${ub.badge?.icon || '🏆'} ${ub.badge?.name}: ${ub.reason || ''}`);
      });
      doc.moveDown(1);
    }

    doc.fontSize(16).fillColor('#1e1b4b').text('Verification History');
    doc.moveDown(0.3);
    verifications.forEach((v) => {
      doc.fontSize(10).fillColor('#334155').text(
        `${v.submissionType} — ${v.status} by ${v.verifier?.name || 'System'} (${new Date(v.reviewedAt).toLocaleDateString()})`
      );
      if (v.feedback) doc.fontSize(9).fillColor('#64748b').text(`  Feedback: ${v.feedback}`);
    });

    doc.end();
  });
};

module.exports = { generateStudentReport };
