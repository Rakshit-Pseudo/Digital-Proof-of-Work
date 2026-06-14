'use client';

import { useEffect, useState } from 'react';
import { Users, FolderOpen, Award, Activity, TrendingUp, ShieldCheck, Briefcase, AlertTriangle, BarChart3, ScrollText, Settings, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const navItems = [
  { href: '/dashboard/admin', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/dashboard/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { href: '/dashboard/admin/logs', label: 'Audit Logs', icon: <ScrollText className="w-4 h-4" /> },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [timeseries, setTimeseries] = useState<Array<{ date: string; signups: number; projects: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getAnalytics(), adminApi.getTimeseries(30)])
      .then(([analyticsRes, timeseriesRes]) => {
        setAnalytics(analyticsRes.data);
        setTimeseries(timeseriesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Admin">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  const users = analytics?.users as Record<string, number> | undefined;
  const projects = analytics?.projects as Record<string, number> | undefined;
  const certificates = analytics?.certificates as Record<string, number> | undefined;
  const recentActivity = (analytics?.recentActivity as Array<Record<string, unknown>>) || [];

  const statCards = [
    { label: 'Total Users', value: users?.total ?? 0, icon: <Users className="w-5 h-5" />, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Students', value: users?.students ?? 0, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 text-blue-600' },
    { label: 'Total Projects', value: projects?.total ?? 0, icon: <FolderOpen className="w-5 h-5" />, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 text-purple-600' },
    { label: 'Badges Awarded', value: String(analytics?.badgesAwarded ?? 0), icon: <Award className="w-5 h-5" />, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 text-amber-600' },
  ];

  const roleData = [
    { name: 'Students', value: users?.students ?? 0 },
    { name: 'Verifiers', value: users?.verifiers ?? 0 },
    { name: 'Recruiters', value: users?.recruiters ?? 0 },
    { name: 'Admins', value: users?.admins ?? 0 },
  ];

  const projectsData = [
    { name: 'Approved', value: projects?.approved ?? 0, fill: '#10b981' },
    { name: 'Pending', value: projects?.pending ?? 0, fill: '#f59e0b' },
    { name: 'Other', value: Math.max(0, (projects?.total ?? 0) - (projects?.approved ?? 0) - (projects?.pending ?? 0)), fill: '#6b7280' },
  ];

  // Show last 14 days for cleaner chart
  const chartData = timeseries.slice(-14).map((d) => ({
    date: d.date.slice(5), // MM-DD
    signups: d.signups,
    projects: d.projects,
  }));

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
            <p className="text-sm text-gray-500 mt-0.5">Overview of all platform activity</p>
          </div>
          <Link href="/dashboard/admin/users" className="btn-primary text-sm">
            <Users className="w-4 h-4" /> Manage Users
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeseries Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Growth Trend</h3>
                <p className="text-xs text-gray-500">Last 14 days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} dot={false} name="New Users" />
                <Line type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} dot={false} name="Projects" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">User Roles</h3>
            <p className="text-xs text-gray-500 mb-4">Distribution by role</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roleData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {roleData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Verification Stats Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Verification Stats</h3>
            <p className="text-xs text-gray-500 mb-4">Projects by status</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={projectsData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {projectsData.map((item, index) => (
                    <Cell key={index} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">{projects?.approved ?? 0}</p>
                <p className="text-xs text-green-600">Approved</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-yellow-700">{projects?.pending ?? 0}</p>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-700">{certificates?.approved ?? 0}</p>
                <p className="text-xs text-blue-600">Certs ✓</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Recent Activity
                </h3>
              </div>
              <Link href="/dashboard/admin/logs" className="text-xs text-indigo-600 hover:underline">
                View all →
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((log) => (
                  <div key={String(log._id)} className="flex items-start gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate">
                        <span className="font-medium">{(log.user as { name?: string })?.name || 'System'}</span>
                        {' — '}{String(log.action)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(String(log.createdAt))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Banners */}
        {(users?.suspended ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{users?.suspended} accounts</span> are currently suspended.{' '}
              <Link href="/dashboard/admin/users" className="underline font-medium">Manage users →</Link>
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
