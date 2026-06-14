'use client';

import { useEffect, useState } from 'react';
import { Plus, Send, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { certificatesApi } from '@/lib/api';
import { Certificate } from '@/types';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/student', label: 'Overview' },
  { href: '/dashboard/student/projects', label: 'Projects' },
  { href: '/dashboard/student/certificates', label: 'Certificates' },
  { href: '/dashboard/student/profile', label: 'Profile' },
];

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', issuer: '', issueDate: '', credentialUrl: '' });

  const fetchCerts = () => {
    certificatesApi.list().then(({ data }) => setCertificates(data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCerts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await certificatesApi.create(form);
    setForm({ title: '', issuer: '', issueDate: '', credentialUrl: '' });
    setShowForm(false);
    fetchCerts();
  };

  const handleSubmit = async (id: string) => {
    await certificatesApi.submit(id);
    fetchCerts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate?')) return;
    await certificatesApi.delete(id);
    fetchCerts();
  };

  return (
    <DashboardLayout navItems={navItems} title="Student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Certificates</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Certificate
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
                <label className="label">Issuer</label>
                <input className="input" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} required />
              </div>
              <div>
                <label className="label">Issue Date</label>
                <input type="date" className="input" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
              </div>
              <div>
                <label className="label">Credential URL</label>
                <input className="input" value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : certificates.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No certificates yet.</div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert._id} className="card p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{cert.title}</h3>
                    <StatusBadge status={cert.verificationStatus} />
                  </div>
                  <p className="text-sm text-gray-600">{cert.issuer} · {formatDate(cert.issueDate)}</p>
                  {cert.skills?.length ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cert.skills.map((s) => <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>)}
                    </div>
                  ) : null}
                  {cert.feedback && cert.verificationStatus === 'rejected' && (
                    <p className="text-sm text-red-600 mt-2">Feedback: {cert.feedback}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {cert.verificationStatus === 'draft' && (
                    <button onClick={() => handleSubmit(cert._id)} className="btn-primary text-xs">
                      <Send className="w-3 h-3" /> Submit
                    </button>
                  )}
                  {cert.verificationStatus !== 'approved' && (
                    <button onClick={() => handleDelete(cert._id)} className="btn-danger text-xs">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
