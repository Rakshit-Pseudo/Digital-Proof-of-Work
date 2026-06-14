'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/admin', label: 'Analytics' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/logs', label: 'Audit Logs' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = () => {
    const params: Record<string, string> = { limit: '50' };
    if (actionFilter) params.action = actionFilter;
    adminApi.getAuditLogs(params).then(({ data }) => setLogs(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-semibold">Audit Logs</h2>
          <div className="flex gap-2">
            <input className="input max-w-xs" placeholder="Filter by action..." value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} />
            <button onClick={fetchLogs} className="btn-secondary">Filter</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No audit logs</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Resource</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={String(log._id)} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{(log.user as { name?: string })?.name || 'System'}</td>
                    <td className="p-3"><span className="badge bg-gray-100 text-gray-700">{String(log.action)}</span></td>
                    <td className="p-3 text-gray-500 capitalize">{String(log.resource)}</td>
                    <td className="p-3 text-gray-400">{formatDate(String(log.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
