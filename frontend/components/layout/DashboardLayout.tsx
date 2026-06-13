'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, LayoutDashboard, FolderOpen, Award, User, Clock, CheckCircle, XCircle, Search, Bookmark, Users, Activity, Settings, FileText, Github, Trophy, BarChart3, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import NotificationBell from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

const roleGradients: Record<string, string> = {
  student: 'from-indigo-900 via-indigo-800 to-purple-900',
  verifier: 'from-teal-900 via-teal-800 to-emerald-900',
  recruiter: 'from-violet-900 via-violet-800 to-purple-900',
  admin: 'from-slate-900 via-slate-800 to-gray-900',
};

const roleAccents: Record<string, string> = {
  student: 'bg-indigo-500',
  verifier: 'bg-teal-500',
  recruiter: 'bg-violet-500',
  admin: 'bg-slate-500',
};

export default function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const gradient = roleGradients[user?.role || 'student'];
  const accent = roleAccents[user?.role || 'student'];

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          `fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b ${gradient} text-white flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-2xl`,
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">D</span>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">DPOW</p>
              <p className="text-xs text-white/50 capitalize">{title} Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                {item.icon && (
                  <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-white/50')}>
                    {item.icon}
                  </span>
                )}
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className={`w-9 h-9 rounded-full ${accent} flex items-center justify-center text-sm font-bold ring-2 ring-white/20 flex-shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-white/50 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900 capitalize leading-tight">
                {title} Dashboard
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block capitalize">
                {title} • DPOW Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
