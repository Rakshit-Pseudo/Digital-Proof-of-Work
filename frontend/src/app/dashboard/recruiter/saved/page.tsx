'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { recruiterApi, reportsApi } from '@/lib/api';
import { downloadPdf } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard/recruiter', label: 'Overview' },
  { href: '/dashboard/recruiter/search', label: 'Search Students' },
  { href: '/dashboard/recruiter/saved', label: 'Saved Candidates' },
];

export default function RecruiterSavedPage() {
  const [saved, setSaved] = useState<Array<{ _id: string; student: { _id: string; name: string; email: string; skills?: string[]; profileCompletion?: number }; notes?: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = () => {
    recruiterApi.getSaved().then(({ data }) => setSaved(data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleRemove = async (studentId: string) => {
    await recruiterApi.removeSaved(studentId);
    fetchSaved();
  };

  const handleDownload = async (studentId: string, name: string) => {
    const { data } = await reportsApi.downloadStudent(studentId);
    await downloadPdf(data, `dpow-${name.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Saved Candidates ({saved.length})</h2>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : saved.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No saved candidates yet</div>
        ) : (
          <div className="space-y-4">
            {saved.map((item) => (
              <div key={item._id} className="card p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{item.student.name}</h3>
                  <p className="text-sm text-gray-500">{item.student.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.student.profileCompletion ?? 0}% profile complete</p>
                  {item.student.skills?.length ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.student.skills.slice(0, 6).map((s) => (
                        <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/dashboard/recruiter/portfolio/${item.student._id}`} className="btn-secondary text-xs">
                    <Eye className="w-3 h-3" /> View
                  </Link>
                  <button onClick={() => handleDownload(item.student._id, item.student.name)} className="btn-primary text-xs">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button onClick={() => handleRemove(item.student._id)} className="btn-danger text-xs">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
