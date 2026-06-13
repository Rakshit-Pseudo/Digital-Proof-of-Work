const axios = require('axios');
const { chatCompletion, parseJSON } = require('./openai.service');
const GitHubAnalysis = require('../models/GitHubAnalysis');

const parseRepoUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub repository URL');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
};

const fetchRepoData = async (owner, repo) => {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [repoRes, languagesRes, readmeRes] = await Promise.allSettled([
    axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
    axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
    axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...headers, Accept: 'application/vnd.github.raw' },
    }),
  ]);

  if (repoRes.status === 'rejected') {
    throw new Error('Repository not found or inaccessible');
  }

  const repoData = repoRes.value.data;
  const languages = languagesRes.status === 'fulfilled' ? languagesRes.value.data : {};
  const readme = readmeRes.status === 'fulfilled' ? readmeRes.value.data : '';

  return {
    name: repoData.name,
    description: repoData.description || '',
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    language: repoData.language,
    topics: repoData.topics || [],
    languages,
    readme: typeof readme === 'string' ? readme.slice(0, 4000) : '',
    createdAt: repoData.created_at,
    updatedAt: repoData.updated_at,
  };
};

const analyzeRepository = async (repoUrl, userId, projectId = null) => {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const repoData = await fetchRepoData(owner, repo);

  const systemPrompt = `You are a technical portfolio analyst. Analyze GitHub repositories and return structured JSON with:
- summary: 2-3 sentence project summary
- technologies: array of detected technologies/frameworks
- skills: array of skills demonstrated
- complexity: "beginner" | "intermediate" | "advanced"
- highlights: array of 3-5 key project highlights`;

  const userPrompt = `Analyze this GitHub repository:
Name: ${repoData.name}
Description: ${repoData.description}
Primary Language: ${repoData.language}
Topics: ${repoData.topics.join(', ')}
Languages: ${JSON.stringify(repoData.languages)}
Stars: ${repoData.stars}, Forks: ${repoData.forks}
README excerpt:
${repoData.readme}`;

  const aiResponse = await chatCompletion(systemPrompt, userPrompt, { json: true });
  const analysis = parseJSON(aiResponse);

  const record = await GitHubAnalysis.create({
    user: userId,
    project: projectId,
    repoUrl,
    repoName: repoData.name,
    summary: analysis.summary,
    technologies: analysis.technologies || [],
    skills: analysis.skills || [],
    complexity: analysis.complexity || 'intermediate',
    highlights: analysis.highlights || [],
    rawAnalysis: { repoData, aiAnalysis: analysis },
  });

  return record;
};

const generateProjectSummary = async (project) => {
  const systemPrompt = 'Generate a professional 2-3 sentence project summary for a student portfolio.';
  const userPrompt = `Title: ${project.title}\nDescription: ${project.description}\nTechnologies: ${(project.technologies || []).join(', ')}`;
  return chatCompletion(systemPrompt, userPrompt);
};

module.exports = { analyzeRepository, generateProjectSummary, fetchRepoData, parseRepoUrl };
