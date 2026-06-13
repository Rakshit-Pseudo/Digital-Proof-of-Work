'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { verificationsApi } from '@/lib/api';
import { Project, Certificate } from '@/types';

const navItems = [
  { href: '/dashboard/verifier', label: 'Overview' },
  { href: '/dashboard/verifier/pending', label: 'Pending' },
  { href: '/dashboard/verifier/approved', label: 'Approved' },
  { href: '/dashboard/verifier/rejected', label: 'Rejected' },
];

interface PendingItem {
  type: 'project' | 'certificate';
  submission: Project | Certificate;
}

function SubmissionReview({ item, onReviewed }: { item: PendingItem; onReviewed: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const sub = item.submission;

  const handleReview = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await verificationsApi.review(item.type, sub._id, { status, feedback });
      onReviewed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-brand-50 text-brand-700 capitalize">{item.type}</span>
            <StatusBadge status={sub.verificationStatus} />
          </div>
          <h3 className="font-semibold text-lg">{sub.title}</h3>
          <p className="text-sm text-gray-500">
            By {(sub as Project).student?.name || 'Student'}
          </p>
        </div>
      </div>

      {'description' in sub && (
        <p className="text-sm text-gray-600 mb-3">{sub.description}</p>
      )}
      {'issuer' in sub && (
        <p className="text-sm text-gray-600 mb-3">Issuer: {sub.issuer}</p>
      )}
      {'summary' in sub && sub.summary && (
        <p className="text-sm bg-brand-50 p-2 rounded-lg mb-3">{sub.summary}</p>
      )}
      {'technologies' in sub && sub.technologies?.length ? (
        <div className="flex flex-wrap gap-1 mb-3">
          {sub.technologies.map((t) => <span key={t} className="badge bg-gray-100 text-gray-700">{t}</span>)}
        </div>
      ) : null}

      <div className="mb-3">
        <label className="label">Feedback (optional)</label>
        <textarea
          className="input min-h-[60px]"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add feedback for the student..."
        />
      </div>

      <div className="flex gap-2">
        <button onClick={() => handleReview('approved')} disabled={loading} className="btn-success">
          <Check className="w-4 h-4" /> Approve
        </button>
        <button onClick={() => handleReview('rejected')} disabled={loading} className="btn-danger">
          <X className="w-4 h-4" /> Reject
        </button>
      </div>
    </div>
  );
}

export default function VerifierPendingPage() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = () => {
    verificationsApi.getPending().then(({ data }) => setPending(data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  return (
    <DashboardLayout navItems={navItems} title="Verifier">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Pending Submissions ({pending.length})</h2>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : pending.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No pending submissions</div>
        ) : (
          <div className="space-y-4">
            {pending.map((item) => (
              <SubmissionReview
                key={`${item.type}-${item.submission._id}`}
                item={item}
                onReviewed={fetchPending}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
