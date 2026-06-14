'use client';

import { useEffect, useState } from 'react';
import { XCircle, Clock, CheckCircle, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { verificationsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/verifier', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/verifier/pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/verifier/approved', label: 'Approved', icon: <CheckCircle className="w-4 h-4" /> },
  { href: '/dashboard/verifier/rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4" /> },
];

export default function VerifierRejectedPage() {
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationsApi.getHistory({ status: 'rejected' })
      .then(({ data }) => setHistory(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Verifier">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rejected Submissions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Submissions that were not approved</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              emoji="✅"
              title="No rejected submissions"
              description="All reviewed submissions were approved!"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={String(item._id)} className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge bg-red-50 text-red-700 capitalize">{String(item.submissionType)}</span>
                      <StatusBadge status={String(item.status)} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Student: {(item.student as { name?: string })?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(String(item.reviewedAt || item.createdAt))}
                    </p>
                    {item.feedback && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-xs font-semibold text-red-700 mb-1">Feedback given:</p>
                        <p className="text-sm text-red-600">{String(item.feedback)}</p>
                      </div>
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
