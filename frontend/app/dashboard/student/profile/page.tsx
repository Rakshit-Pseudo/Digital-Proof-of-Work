'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usersApi, badgesApi } from '@/lib/api';
import { User } from '@/types';

const navItems = [
  { href: '/dashboard/student', label: 'Overview' },
  { href: '/dashboard/student/projects', label: 'Projects' },
  { href: '/dashboard/student/certificates', label: 'Certificates' },
  { href: '/dashboard/student/profile', label: 'Profile' },
];

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', githubUsername: '', linkedinUrl: '', skills: '',
    institution: '', degree: '', field: '',
  });
  const [suggestions, setSuggestions] = useState<Array<{ badgeName: string; reason: string }>>([]);

  useEffect(() => {
    Promise.all([usersApi.getProfile(), badgesApi.suggestions()])
      .then(([profileRes, suggestionsRes]) => {
        const p = profileRes.data;
        setProfile(p);
        setForm({
          name: p.name || '',
          bio: p.bio || '',
          githubUsername: p.githubUsername || '',
          linkedinUrl: p.linkedinUrl || '',
          skills: (p.skills || []).join(', '),
          institution: p.education?.[0]?.institution || '',
          degree: p.education?.[0]?.degree || '',
          field: p.education?.[0]?.field || '',
        });
        setSuggestions(suggestionsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const education = form.institution ? [{
        institution: form.institution,
        degree: form.degree,
        field: form.field,
      }] : [];

      const { data } = await usersApi.updateProfile({
        name: form.name,
        bio: form.bio,
        githubUsername: form.githubUsername,
        linkedinUrl: form.linkedinUrl,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        education,
      });
      setProfile(data);
    } finally {
      setSaving(false);
    }
  };

  const handleAggregateSkills = async () => {
    const { data } = await usersApi.aggregateSkills();
    setForm((f) => ({ ...f, skills: data.skills.join(', ') }));
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Student">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Student">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Profile</h2>
          <span className="text-sm text-gray-500">{profile?.profileCompletion ?? 0}% complete</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all"
            style={{ width: `${profile?.profileCompletion ?? 0}%` }}
          />
        </div>

        <form onSubmit={handleSave} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input min-h-[80px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">GitHub Username</label>
              <input className="input" value={form.githubUsername} onChange={(e) => setForm({ ...form, githubUsername: e.target.value })} />
            </div>
            <div>
              <label className="label">LinkedIn URL</label>
              <input className="input" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Skills</label>
              <button type="button" onClick={handleAggregateSkills} className="text-xs text-brand-600 hover:underline">
                Aggregate from projects
              </button>
            </div>
            <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Python..." />
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Education</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Institution</label>
                <input className="input" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
              </div>
              <div>
                <label className="label">Degree</label>
                <input className="input" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Field of Study</label>
                <input className="input" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold mb-3">AI Badge Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="text-sm p-2 bg-brand-50 rounded-lg">
                  <span className="font-medium">{s.badgeName}</span> — {s.reason}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
