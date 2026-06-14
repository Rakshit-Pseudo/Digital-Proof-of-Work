'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, LogOut, Home, Users, BarChart3, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import { getSocket } from '@/lib/socket';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = getSocket();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join', { userId: user._id, role: user.role });
      socket.on('notification', () => {
        setUnreadCount((prev) => prev + 1);
      });
    }
  }, [socket, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const getDashboardLinks = () => {
    const baseLinks = [{ label: 'Dashboard', href: `/dashboard/${user.role}`, icon: Home }];

    if (user.role === 'student') {
      return [
        ...baseLinks,
        { label: 'Projects', href: '/dashboard/student/projects', icon: Home },
        { label: 'Certificates', href: '/dashboard/student/certificates', icon: Home },
        { label: 'Badges', href: '/dashboard/student/badges', icon: Home },
        { label: 'GitHub Analysis', href: '/dashboard/student/github-analysis', icon: Home },
        { label: 'Profile', href: '/dashboard/student/profile', icon: Settings },
      ];
    }

    if (user.role === 'verifier') {
      return [
        ...baseLinks,
        { label: 'Pending', href: '/dashboard/verifier/pending', icon: Users },
        { label: 'History', href: '/dashboard/verifier/history', icon: BarChart3 },
      ];
    }

    if (user.role === 'recruiter') {
      return [
        ...baseLinks,
        { label: 'Search', href: '/dashboard/recruiter/search', icon: Users },
        { label: 'Saved Candidates', href: '/dashboard/recruiter/saved', icon: Home },
        { label: 'Reports', href: '/dashboard/recruiter/portfolio', icon: BarChart3 },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...baseLinks,
        { label: 'Analytics', href: '/dashboard/admin', icon: BarChart3 },
        { label: 'Users', href: '/dashboard/admin/users', icon: Users },
        { label: 'Audit Logs', href: '/dashboard/admin/logs', icon: BarChart3 },
        { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
      ];
    }

    return baseLinks;
  };

  const navLinks = getDashboardLinks();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-indigo-400">DPOW</h2>
          <p className="text-sm text-slate-400 mt-1">Digital Proof of Work</p>
        </div>

        <nav className="p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium mb-2 hover:bg-slate-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-sm font-medium hover:bg-red-600 bg-red-500 text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Link href="/notifications" className="relative p-2 hover:bg-slate-100 rounded-lg">
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
