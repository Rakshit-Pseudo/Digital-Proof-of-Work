'use client';

import { useEffect, useState } from 'react';
import { Trophy, Zap, RefreshCw, Award, FolderOpen, User, BarChart3 } from 'lucide-react';
import { Github } from '@/components/ui/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { badgesApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const navItems = [
  { href: '/dashboard/student', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/dashboard/student/projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/dashboard/student/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { href: '/dashboard/student/badges', label: 'Badges', icon: <Trophy className="w-4 h-4" /> },
  { href: '/dashboard/student/github-analysis', label: 'AI Analysis', icon: <Github className="w-4 h-4" /> },
  { href: '/dashboard/student/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

interface UserBadge {
  badge: Badge;
  reason: string;
  earnedAt: string;
}

interface BadgeSuggestion {
  badge: Badge;
  reason: string;
  progress?: number;
}

export default function StudentBadgesPage() {
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [suggestions, setSuggestions] = useState<BadgeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    Promise.all([badgesApi.my(), badgesApi.suggestions()])
      .then(([myRes, suggestionsRes]) => {
        setMyBadges(myRes.data || []);
        setSuggestions(suggestionsRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckBadges = async () => {
    setChecking(true);
    try {
      const { data } = await badgesApi.check();
      if (data.newBadges?.length) {
        success(`🎉 You earned ${data.newBadges.length} new badge(s)!`);
        const { data: updated } = await badgesApi.my();
        setMyBadges(updated || []);
      } else {
        success('No new badges earned yet. Keep going!');
      }
    } catch {
      error('Failed to check badges. Try again.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Student">
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  const badgeColors = [
    'from-amber-400 to-orange-500',
    'from-indigo-400 to-purple-500',
    'from-teal-400 to-emerald-500',
    'from-rose-400 to-pink-500',
    'from-sky-400 to-blue-500',
  ];

  return (
    <DashboardLayout navItems={navItems} title="Student">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Badges</h2>
            <p className="text-sm text-gray-500 mt-0.5">Achievements earned through your work</p>
          </div>
          <button
            onClick={handleCheckBadges}
            disabled={checking}
            className="btn-primary"
          >
            {checking ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Checking...</>
            ) : (
              <><Zap className="w-4 h-4" /> Check for New Badges</>
            )}
          </button>
        </div>

        {/* Earned Badges */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Earned ({myBadges.length})
          </h3>
          {myBadges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <EmptyState
                emoji="🏆"
                title="No badges yet"
                description="Complete and verify projects to earn your first badge!"
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBadges.map((ub, i) => (
                <div
                  key={String(ub.badge?._id || i)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className={`h-24 bg-gradient-to-br ${badgeColors[i % badgeColors.length]} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {ub.badge?.icon || '🏅'}
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-base">{ub.badge?.name || 'Badge'}</h4>
                    {ub.badge?.description && (
                      <p className="text-xs text-gray-500 mt-1">{ub.badge.description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <p className="text-xs text-gray-400 italic">"{ub.reason}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Badge Suggestions */}
        {suggestions.length > 0 && (
          <section>
            <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              Badges You Can Earn ({suggestions.length})
            </h3>
            <p className="text-xs text-gray-500 mb-4">Keep working to unlock these achievements</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <div
                  key={String(s.badge?._id || i)}
                  className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl grayscale">
                      {s.badge?.icon || '🏅'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">{s.badge?.name}</h4>
                      <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Locked</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{s.badge?.criteria || s.reason}</p>
                  {s.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{s.progress}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
