'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle, ShieldCheck, ArrowRight, Award, FolderOpen } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { verificationsApi } from '@/lib/api';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/verifier', label: 'Overview' },
  { href: '/dashboard/verifier/pending', label: 'Pending' },
  { href: '/dashboard/verifier/approved', label: 'Approved' },
  { href: '/dashboard/verifier/rejected', label: 'Rejected' },
];

const COLORS = ['#10b981', '#ef4444'];

interface VerificationHistoryItem {
  _id: string;
  submissionType: 'project' | 'certificate';
  student: {
    name: string;
    email: string;
  };
  status: 'approved' | 'rejected';
  createdAt: string;
}

export default function VerifierDashboard() {
  const [stats, setStats] = useState<{ pending: number; approved: number; rejected: number } | null>(null);
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      verificationsApi.getStats(),
      verificationsApi.getHistory({ limit: '5' })
    ])
      .then(([statsRes, historyRes]) => {
        setStats(statsRes.data);
        setHistory(historyRes.data.data);
      })
      .catch((err) => console.error('Error fetching verifier data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Verifier">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  const pieData = [
    { name: 'Approved', value: stats?.approved ?? 0 },
    { name: 'Rejected', value: stats?.rejected ?? 0 },
  ].filter(d => d.value > 0);

  const totalReviews = (stats?.approved ?? 0) + (stats?.rejected ?? 0);
  const approvalRate = totalReviews > 0 ? Math.round(((stats?.approved ?? 0) / totalReviews) * 100) : 0;

  return (
    <DashboardLayout navItems={navItems} title="Verifier">
      <div className="space-y-6">
        {/* Welcome Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-teal-100">
          <div className="relative z-10 max-w-lg space-y-2">
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Verification Portal
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Maintain Portfolio Quality</h2>
            <p className="text-teal-100 text-sm md:text-base font-light">
              Review pending project submissions and certificate uploads to verify their credentials and skills.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/verifier/pending"
                className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-teal-50 transition-colors"
              >
                <Clock className="w-4 h-4" /> Review Submissions
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4 scale-150">
            <ShieldCheck className="w-96 h-96" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-400">Needs Attention</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.pending ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Pending Review</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs text-green-500 font-medium">Approved</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.approved ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Approved Submissions</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-xs text-red-500 font-medium">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.rejected ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Rejected Submissions</p>
          </div>
        </div>

        {/* Dashboard Split Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side: Stats and Verification Ratio */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Approval Distribution</h3>
              <p className="text-xs text-gray-500 mb-4">Ratio of approved vs rejected submissions</p>

              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed">
                  <ShieldCheck className="w-10 h-10 text-gray-300 mb-2" />
                  <p>No reviews submitted yet.</p>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="w-1/2 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? COLORS[0] : COLORS[1]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-3">
                    <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                      <p className="text-2xl font-bold text-teal-700">{approvalRate}%</p>
                      <p className="text-xs text-teal-600 font-medium">Approval Rate</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-gray-500">Approved</span>
                        </div>
                        <span className="font-semibold text-gray-800">{stats?.approved}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-gray-500">Rejected</span>
                        </div>
                        <span className="font-semibold text-gray-800">{stats?.rejected}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(stats?.pending ?? 0) > 0 && (
              <div className="card p-3 bg-yellow-50 border-yellow-200 mt-4">
                <p className="text-xs text-yellow-800 flex items-center justify-between">
                  <span>You have {stats?.pending} submissions awaiting review.</span>
                  <Link href="/dashboard/verifier/pending" className="font-semibold underline flex items-center gap-1">
                    Review <ArrowRight className="w-3 h-3" />
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Right Side: Recent Verification Log */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Your Recent Activity</h3>
                <Link href="/dashboard/verifier/approved" className="text-xs text-indigo-600 hover:underline">
                  History
                </Link>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl">
                  <p className="text-sm">No verification actions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {history.map((item) => (
                    <div key={item._id} className="flex items-start justify-between text-sm">
                      <div className="flex gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          item.submissionType === 'project' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {item.submissionType === 'project' ? <FolderOpen className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 truncate max-w-[150px]">{item.student?.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.submissionType} · {formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {item.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Link href="/dashboard/verifier/approved" className="btn-secondary flex-1 text-center justify-center py-2 text-xs">
                View Approved
              </Link>
              <Link href="/dashboard/verifier/rejected" className="btn-secondary flex-1 text-center justify-center py-2 text-xs">
                View Rejected
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
