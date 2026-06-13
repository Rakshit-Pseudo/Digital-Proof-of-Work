'use client';

import { useEffect, useState } from 'react';
import { Github, Sparkles, Code2, Zap, Star, History, ExternalLink, Award, FolderOpen, User, Trophy, BarChart3, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { githubApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/student', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/dashboard/student/projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/dashboard/student/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { href: '/dashboard/student/badges', label: 'Badges', icon: <Trophy className="w-4 h-4" /> },
  { href: '/dashboard/student/github-analysis', label: 'AI Analysis', icon: <Github className="w-4 h-4" /> },
  { href: '/dashboard/student/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

interface Analysis {
  _id: string;
  repoUrl: string;
  repoName: string;
  summary: string;
  technologies: string[];
  skills: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  highlights: string[];
  createdAt: string;
}

const complexityColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

export default function GitHubAnalysisPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    githubApi.history()
      .then(({ data }) => setHistory(data || []))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setAnalyzing(true);
    setResult(null);
    try {
      const { data } = await githubApi.analyze(repoUrl.trim());
      setResult(data);
      setHistory((prev) => [data, ...prev]);
      success('Repository analyzed successfully!');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error(message || 'Failed to analyze repository. Check the URL and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Github className="w-6 h-6" />
            AI GitHub Analysis
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Analyze your GitHub repositories using AI to extract skills, technologies, and generate summaries.
          </p>
        </div>

        {/* Analyzer Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Repository Analyzer</h3>
              <p className="text-xs text-gray-400">Powered by OpenAI GPT</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                disabled={analyzing}
              />
            </div>
            <button
              type="submit"
              disabled={analyzing || !repoUrl.trim()}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex-shrink-0"
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Zap className="w-4 h-4" /> Analyze</>
              )}
            </button>
          </form>

          {analyzing && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  Fetching repository data and running AI analysis...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-gray-700" />
                  <div>
                    <h3 className="font-bold text-gray-900">{result.repoName}</h3>
                    <a href={result.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                      {result.repoUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${complexityColors[result.complexity] || complexityColors.intermediate}`}>
                  {result.complexity} level
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  AI Summary
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-indigo-50 p-4 rounded-xl">
                  {result.summary}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Technologies */}
                {result.technologies?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-teal-500" />
                      Technologies ({result.technologies.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {result.skills?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      Skills Detected ({result.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {result.highlights?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {result.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            Analysis History ({history.length})
          </h3>

          {loadingHistory ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <EmptyState
                emoji="🔍"
                title="No analyses yet"
                description="Enter a GitHub URL above to get started with AI analysis"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Github className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.repoName}</p>
                        <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1">
                          View on GitHub <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full border capitalize ${complexityColors[item.complexity] || complexityColors.intermediate}`}>
                        {item.complexity}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  {item.summary && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                  )}
                  {item.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.technologies.slice(0, 6).map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {t}
                        </span>
                      ))}
                      {item.technologies.length > 6 && (
                        <span className="text-xs text-gray-400">+{item.technologies.length - 6} more</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
