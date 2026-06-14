'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { verificationsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/verifier', label: 'Overview' },
  { href: '/dashboard/verifier/pending', label: 'Pending' },
  { href: '/dashboard/verifier/approved', label: 'Approved' },
  { href: '/dashboard/verifier/rejected', label: 'Rejected' },
];

export default function VerifierApprovedPage() {
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationsApi.getHistory({ status: 'approved' })
      .then(({ data }) => setHistory(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Verifier">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Approved Submissions</h2>
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : history.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No approved submissions yet</div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={String(item._id)} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-50 text-brand-700 capitalize">{String(item.submissionType)}</span>
                    <StatusBadge status={String(item.status)} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Student: {(item.student as { name?: string })?.name} · {formatDate(String(item.reviewedAt))}
                  </p>
                  {Boolean(item.feedback) && (
                    <p className="text-sm text-gray-500 mt-1">Feedback: {String(item.feedback)}</p>
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
