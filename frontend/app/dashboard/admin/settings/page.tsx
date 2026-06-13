'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

const navItems = [
  { href: '/dashboard/admin', label: 'Analytics' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/logs', label: 'Audit Logs' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

export default function AdminSettingsPage() {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const seedBadges = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const { data } = await api.post('/badges/seed');
      setMessage(`Seeded ${data.count} badges successfully`);
    } catch {
      setMessage('Failed to seed badges');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="max-w-2xl space-y-6">
        <h2 className="text-xl font-semibold">Settings</h2>

        <div className="card p-6 space-y-4">
          <h3 className="font-medium">Badge Management</h3>
          <p className="text-sm text-gray-600">Seed default badges into the system. Safe to run multiple times.</p>
          <button onClick={seedBadges} disabled={seeding} className="btn-primary">
            {seeding ? 'Seeding...' : 'Seed Default Badges'}
          </button>
          {message && <p className="text-sm text-brand-600">{message}</p>}
        </div>

        <div className="card p-6 space-y-2">
          <h3 className="font-medium">Platform Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Digital Proof of Work — Part 2</p>
            <p>Stack: Next.js 15, Express, MongoDB, OpenAI, Socket.io</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
