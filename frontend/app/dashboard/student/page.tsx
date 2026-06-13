'use client';

import { FolderOpen, Award, User, Github, Trophy, TrendingUp, CheckCircle, Clock, XCircle, Zap, BarChart3, ScrollText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect, useState } from 'react';
import { usersApi, badgesApi } from '@/lib/api';
import Link from 'next/link';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const navItems = [
  { href: '/dashboard/student', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/dashboard/student/projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/dashboard/student/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { href: '/dashboard/student/badges', label: 'Badges', icon: <Trophy className="w-4 h-4" /> },
  { href: '/dashboard/student/github-analysis', label: 'AI Analysis', icon: <Github className="w-4 h-4" /> },
  { href: '/dashboard/student/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

export default function StudentDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [badges, setBadges] = useState<Array<{ badge: { name: string; icon: string }; reason: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersApi.getDashboardStats(), badgesApi.my()])
      .then(([statsRes, badgesRes]) => {
        setStats(statsRes.data);
        setBadges(badgesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Student">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  const profileCompletion = Number(stats?.profileCompletion ?? 0);

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: <FolderOpen className="w-5 h-5" />, bg: 'bg-indigo-50 text-indigo-600', trend: '+' },
    { label: 'Verified Projects', value: stats?.approvedProjects ?? 0, icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50 text-green-600', trend: '✓' },
    { label: 'Certificates', value: stats?.totalCertificates ?? 0, icon: <Award className="w-5 h-5" />, bg: 'bg-amber-50 text-amber-600', trend: '+' },
    { label: 'Badges Earned', value: badges.length, icon: <Trophy className="w-5 h-5" />, bg: 'bg-purple-50 text-purple-600', trend: '🏆' },
  ];

  // Build radar data from skills (mock for demo if no skills)
  const skills = (stats as Record<string, string[]>)?.skills || [];
  const radarData = skills.length
    ? skills.slice(0, 6).map((s) => ({ subject: s, value: Math.floor(Math.random() * 40 + 60) }))
    : [
        { subject: 'Projects', value: Math.min(100, Number(stats?.totalProjects ?? 0) * 20) },
        { subject: 'Verified', value: Math.min(100, Number(stats?.approvedProjects ?? 0) * 25) },
        { subject: 'Certs', value: Math.min(100, Number(stats?.totalCertificates ?? 0) * 30) },
        { subject: 'Profile', value: profileCompletion },
        { subject: 'Badges', value: Math.min(100, badges.length * 25) },
      ];

  return (
    <DashboardLayout navItems={navItems} title="Student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">Track your progress and portfolio</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/student/projects" className="btn-primary text-sm">
              <FolderOpen className="w-4 h-4" /> Add Project
            </Link>
          </div>
        </div>

        {/* Profile completion banner */}
        {profileCompletion < 100 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-lg">Complete your profile ✨</p>
              <p className="text-indigo-100 text-sm mt-0.5">
                Your profile is {profileCompletion}% complete. Add more details to get discovered by recruiters.
              </p>
              <div className="mt-3 bg-white/20 rounded-full h-2 w-64 max-w-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
            <Link href="/dashboard/student/profile" className="bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors flex-shrink-0">
              Update Profile →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{String(card.value)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skill Radar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Portfolio Radar</h3>
            <p className="text-xs text-gray-500 mb-3">Your skill profile at a glance</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Approved Projects</span>
                </div>
                <span className="text-lg font-bold text-green-700">{String(stats?.approvedProjects ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">Pending Review</span>
                </div>
                <span className="text-lg font-bold text-yellow-700">{String(stats?.pendingProjects ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Approved Certs</span>
                </div>
                <span className="text-lg font-bold text-blue-700">{String(stats?.approvedCertificates ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Earned Badges</h3>
              <Link href="/dashboard/student/badges" className="text-xs text-indigo-600 hover:underline">
                View all →
              </Link>
            </div>
            {badges.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-sm text-gray-500">Submit verified projects to earn badges</p>
                <Link href="/dashboard/student/projects" className="mt-3 inline-block text-xs text-indigo-600 underline">
                  Add project →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {badges.slice(0, 5).map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                    <span className="text-xl">{b.badge?.icon || '🏅'}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{b.badge?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{b.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/dashboard/student/github-analysis" className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white hover:from-gray-800 hover:to-gray-700 transition-colors group">
            <Github className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold">AI GitHub Analysis</p>
            <p className="text-xs text-gray-400 mt-1">Analyze your repos with AI</p>
          </Link>
          <Link href="/dashboard/student/certificates" className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white hover:from-amber-600 hover:to-orange-600 transition-colors group">
            <Award className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold">Add Certificate</p>
            <p className="text-xs text-amber-100 mt-1">Upload your certifications</p>
          </Link>
          <Link href="/dashboard/student/badges" className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white hover:from-purple-700 hover:to-indigo-700 transition-colors group">
            <Zap className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold">Badge Suggestions</p>
            <p className="text-xs text-purple-200 mt-1">See what badges you can earn</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
