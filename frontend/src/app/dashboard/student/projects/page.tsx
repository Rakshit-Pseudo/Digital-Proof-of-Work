'use client';

import { useEffect, useState } from 'react';
import { Plus, Sparkles, Send, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { projectsApi, githubApi } from '@/lib/api';
import { Project } from '@/types';

const navItems = [
  { href: '/dashboard/student', label: 'Overview' },
  { href: '/dashboard/student/projects', label: 'Projects' },
  { href: '/dashboard/student/certificates', label: 'Certificates' },
  { href: '/dashboard/student/profile', label: 'Profile' },
];

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', githubUrl: '', liveUrl: '', technologies: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProjects = () => {
    projectsApi.list().then(({ data }) => setProjects(data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await projectsApi.create({
      ...form,
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setForm({ title: '', description: '', githubUrl: '', liveUrl: '', technologies: '' });
    setShowForm(false);
    fetchProjects();
  };

  const handleSubmit = async (id: string) => {
    setActionLoading(id);
    try {
      await projectsApi.submit(id);
      fetchProjects();
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnalyze = async (project: Project) => {
    setActionLoading(project._id);
    try {
      if (project.githubUrl) {
        await githubApi.analyze(project.githubUrl, project._id);
      } else {
        await projectsApi.analyze(project._id);
      }
      fetchProjects();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await projectsApi.delete(id);
    fetchProjects();
  };

  return (
    <DashboardLayout navItems={navItems} title="Student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Projects</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="card p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">GitHub URL</label>
                <input className="input" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Live URL</label>
                <input className="input" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
              </div>
              <div>
                <label className="label">Technologies (comma-separated)</label>
                <input className="input" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save Project</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No projects yet. Add your first project!</div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{project.title}</h3>
                      <StatusBadge status={project.verificationStatus} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    {project.summary && (
                      <p className="text-sm text-brand-700 bg-brand-50 p-2 rounded-lg mb-2">{project.summary}</p>
                    )}
                    {project.technologies?.length ? (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.technologies.map((t) => (
                          <span key={t} className="badge bg-gray-100 text-gray-700">{t}</span>
                        ))}
                      </div>
                    ) : null}
                    {project.feedback && project.verificationStatus === 'rejected' && (
                      <p className="text-sm text-red-600">Feedback: {project.feedback}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {project.verificationStatus === 'draft' && (
                      <>
                        <button onClick={() => handleAnalyze(project)} disabled={actionLoading === project._id} className="btn-secondary text-xs">
                          <Sparkles className="w-3 h-3" /> AI Analyze
                        </button>
                        <button onClick={() => handleSubmit(project._id)} disabled={actionLoading === project._id} className="btn-primary text-xs">
                          <Send className="w-3 h-3" /> Submit
                        </button>
                      </>
                    )}
                    {project.verificationStatus !== 'approved' && (
                      <button onClick={() => handleDelete(project._id)} className="btn-danger text-xs">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
