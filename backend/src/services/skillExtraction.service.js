const { chatCompletion, parseJSON } = require('./openai.service');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

const extractSkillsFromText = async (text, context = 'project') => {
  const systemPrompt = `Extract technical and soft skills from ${context} content. Return JSON: { "skills": ["skill1", "skill2"] }. Max 15 skills, lowercase.`;
  const response = await chatCompletion(systemPrompt, text, { json: true });
  const parsed = parseJSON(response);
  return parsed.skills || [];
};

const extractProjectSkills = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const text = `${project.title}\n${project.description}\nTechnologies: ${(project.technologies || []).join(', ')}`;
  const skills = await extractSkillsFromText(text, 'project');

  project.skills = [...new Set([...(project.skills || []), ...skills])];
  await project.save();
  return project.skills;
};

const extractCertificateSkills = async (certificateId) => {
  const cert = await Certificate.findById(certificateId);
  if (!cert) throw new Error('Certificate not found');

  const text = `${cert.title}\nIssuer: ${cert.issuer}`;
  const skills = await extractSkillsFromText(text, 'certificate');

  cert.skills = [...new Set([...(cert.skills || []), ...skills])];
  await cert.save();
  return cert.skills;
};

const aggregateUserSkills = async (userId) => {
  const [projects, certificates] = await Promise.all([
    Project.find({ student: userId, verificationStatus: 'approved' }),
    Certificate.find({ student: userId, verificationStatus: 'approved' }),
  ]);

  const allSkills = new Set();
  projects.forEach((p) => (p.skills || []).forEach((s) => allSkills.add(s.toLowerCase())));
  projects.forEach((p) => (p.technologies || []).forEach((t) => allSkills.add(t.toLowerCase())));
  certificates.forEach((c) => (c.skills || []).forEach((s) => allSkills.add(s.toLowerCase())));

  const skills = [...allSkills];
  await User.findByIdAndUpdate(userId, { skills });
  return skills;
};

const detectTechnologies = async (description, existingTech = []) => {
  const systemPrompt = 'Detect technologies from project description. Return JSON: { "technologies": ["tech1"] }';
  const response = await chatCompletion(
    systemPrompt,
    `${description}\nKnown: ${existingTech.join(', ')}`,
    { json: true }
  );
  const parsed = parseJSON(response);
  return [...new Set([...existingTech, ...(parsed.technologies || [])])];
};

module.exports = {
  extractSkillsFromText,
  extractProjectSkills,
  extractCertificateSkills,
  aggregateUserSkills,
  detectTechnologies,
};
