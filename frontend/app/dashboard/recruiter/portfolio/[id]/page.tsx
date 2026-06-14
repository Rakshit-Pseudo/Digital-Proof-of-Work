'use client';

import { useEffect, useState } from 'react';
import { Download, Bookmark } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usersApi, recruiterApi, reportsApi } from '@/lib/api';
import { Project, Certificate } from '@/types';
import { downloadPdf } from '@/lib/utils';
import { useParams } from 'next/navigation';

const navItems = [
  { href: '/dashboard/recruiter', label: 'Overview' },
  { href: '/dashboard/recruiter/search', label: 'Search Students' },
  { href: '/dashboard/recruiter/saved', label: 'Saved Candidates' },
];

export default function RecruiterPortfolioPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [portfolio, setPortfolio] = useState<{
    user: Record<string, unknown>;
    projects: Project[];
    certificates: Certificate[];
    badges: Array<{ badge: { name: string; icon: string } }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getPortfolio(studentId).then(({ data }) => setPortfolio(data)).finally(() => setLoading(false));
  }, [studentId]);

  const handleSave = async () => {
    await recruiterApi.saveCandidate({ studentId });
    alert('Candidate saved!');
  };

  const handleDownload = async () => {
    const name = String(portfolio?.user?.name || 'student');
    const { data } = await reportsApi.downloadStudent(studentId);
    await downloadPdf(data, `dpow-${name.replace(/\s+/g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Recruiter">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout navItems={navItems} title="Recruiter">
        <div className="card p-12 text-center text-gray-500">Portfolio not found</div>
      </DashboardLayout>
    );
  }

  const { user, projects, certificates, badges } = portfolio;

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{String(user.name)}</h2>
            <p className="text-gray-500">{String(user.email)}</p>
            {Boolean(user.bio) && <p className="text-gray-600 mt-2">{String(user.bio)}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-secondary"><Bookmark className="w-4 h-4" /> Save</button>
            <button onClick={handleDownload} className="btn-primary"><Download className="w-4 h-4" /> Download PDF</button>
          </div>
        </div>

        {(user.skills as string[])?.length ? (
          <div className="flex flex-wrap gap-2">
            {(user.skills as string[]).map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
          </div>
        ) : null}

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Projects ({projects.length})</h3>
          {projects.map((p) => (
            <div key={p._id} className="border-b last:border-0 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.title}</span>
                <StatusBadge status={p.verificationStatus} />
              </div>
              <p className="text-sm text-gray-600 mt-1">{p.description}</p>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Certificates ({certificates.length})</h3>
          {certificates.map((c) => (
            <div key={c._id} className="border-b last:border-0 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.title}</span>
                <StatusBadge status={c.verificationStatus} />
              </div>
              <p className="text-sm text-gray-600">{c.issuer}</p>
            </div>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <span key={i} className="badge bg-yellow-50 text-yellow-800">{b.badge?.icon} {b.badge?.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
