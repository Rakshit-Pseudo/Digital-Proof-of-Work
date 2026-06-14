'use client';

import { useEffect, useState } from 'react';
import { Plus, Shield, Briefcase, Ban, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { adminApi } from '@/lib/api';
import { User } from '@/types';

const navItems = [
  { href: '/dashboard/admin', label: 'Analytics' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/logs', label: 'Audit Logs' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });

  const fetchUsers = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    adminApi.getUsers(params).then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.createUser(form);
    setForm({ name: '', email: '', password: '', role: 'student' });
    setShowForm(false);
    fetchUsers();
  };

  const handleSuspend = async (id: string, suspended: boolean) => {
    await adminApi.suspendUser(id, suspended);
    fetchUsers();
  };

  const handleAssignVerifier = async (id: string) => {
    await adminApi.assignVerifier(id);
    fetchUsers();
  };

  const handleAssignRecruiter = async (id: string) => {
    await adminApi.assignRecruiter(id);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    await adminApi.deleteUser(id);
    fetchUsers();
  };

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-semibold">User Management</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <input className="input max-w-xs" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input max-w-xs" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="verifier">Verifier</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={fetchUsers} className="btn-secondary">Filter</button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="card p-6 grid md:grid-cols-2 gap-4">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="verifier">Verifier</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Create User</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3 text-gray-500">{user.email}</td>
                    <td className="p-3 capitalize"><span className="badge bg-brand-50 text-brand-700">{user.role}</span></td>
                    <td className="p-3">
                      {user.isSuspended ? (
                        <span className="badge bg-red-100 text-red-700">Suspended</span>
                      ) : (
                        <span className="badge bg-green-100 text-green-700">Active</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end flex-wrap">
                        {user.role !== 'verifier' && (
                          <button onClick={() => handleAssignVerifier(user._id)} title="Assign Verifier" className="p-1.5 hover:bg-gray-100 rounded">
                            <Shield className="w-4 h-4 text-brand-600" />
                          </button>
                        )}
                        {user.role !== 'recruiter' && (
                          <button onClick={() => handleAssignRecruiter(user._id)} title="Assign Recruiter" className="p-1.5 hover:bg-gray-100 rounded">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSuspend(user._id, !user.isSuspended)}
                          title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Ban className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button onClick={() => handleDelete(user._id)} title="Delete" className="p-1.5 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
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
