'use client';

import { useEffect, useState } from 'react';
import { Users, Bookmark, CheckCircle, Search, Star, ExternalLink, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { recruiterApi } from '@/lib/api';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const navItems = [
  { href: '/dashboard/recruiter', label: 'Overview' },
  { href: '/dashboard/recruiter/search', label: 'Search Students' },
  { href: '/dashboard/recruiter/saved', label: 'Saved Candidates' },
];

interface DashboardStats {
  savedCount: number;
  totalStudents: number;
  verifiedStudents: number;
}

interface SavedCandidate {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    skills?: string[];
    profileCompletion?: number;
  };
  notes?: string;
}

export default function RecruiterDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      recruiterApi.getDashboard(),
      recruiterApi.getSaved()
    ])
      .then(([statsRes, savedRes]) => {
        setStats(statsRes.data);
        setSavedCandidates(savedRes.data);
      })
      .catch((err) => console.error('Error fetching recruiter data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Recruiter">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  // Mock aggregated skills distribution data for visual polish
  const skillDistributionData = [
    { name: 'React', count: 12 },
    { name: 'Node.js', count: 9 },
    { name: 'TypeScript', count: 8 },
    { name: 'Python', count: 6 },
    { name: 'Tailwind CSS', count: 11 },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="space-y-6">
        {/* Welcome Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-indigo-100">
          <div className="relative z-10 max-w-lg space-y-2">
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Recruiter Hub
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Find Verified Top Student Talent</h2>
            <p className="text-indigo-100 text-sm md:text-base font-light">
              Access authenticated projects, certifications, and AI-validated portfolios to scale your hiring.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/recruiter/search"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-indigo-50 transition-colors"
              >
                <Search className="w-4 h-4" /> Start Searching
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4 scale-150">
            <Users className="w-96 h-96" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-400">Total Available</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Students in Database</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                {stats && stats.totalStudents > 0
                  ? Math.round((stats.verifiedStudents / stats.totalStudents) * 100)
                  : 0}% rate
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.verifiedStudents ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Verified Portfolios</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <Link href="/dashboard/recruiter/saved" className="text-xs text-indigo-600 hover:underline">
                View List
              </Link>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.savedCount ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Saved Candidates</p>
          </div>
        </div>

        {/* Dashboard Split View */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Saved Candidates Quick View */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Saved Candidates
                </h3>
                {savedCandidates.length > 3 && (
                  <Link href="/dashboard/recruiter/saved" className="text-xs text-indigo-600 hover:underline">
                    View All ({savedCandidates.length})
                  </Link>
                )}
              </div>

              {savedCandidates.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
                  <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No saved candidates yet.</p>
                  <p className="text-xs mt-1 text-gray-400">Search and save profiles to review later.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedCandidates.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-55 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                          {item.student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{item.student.name}</h4>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">
                          {item.student.profileCompletion ?? 0}% Match
                        </span>
                        <Link
                          href={`/dashboard/recruiter/portfolio/${item.student._id}`}
                          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {savedCandidates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/dashboard/recruiter/saved"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Manage Saved Candidates <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: In-Demand Skills Analytics */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Portfolio Skill Index</h3>
            <p className="text-xs text-gray-500 mb-4">Top skills present on candidate portfolios</p>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={skillDistributionData} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center mt-3">
              <p className="text-xs text-indigo-700 font-light">
                AI extracts skills automatically from code contributions and verified certifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
