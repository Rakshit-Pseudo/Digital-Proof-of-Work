'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { tokenStorage } from '@/lib/auth-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const user = tokenStorage.getUser();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/users/dashboard/stats');
      return res.data;
    },
    retry: false,
  });

  const completion = stats?.profileCompletion ?? 0;
  const projectCount = stats?.totalProjects ?? 0;
  const certificateCount = stats?.totalCertificates ?? 0;

  return (
    <div className="space-y-8 animate-in">
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-violet-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome back, {user?.name || 'Student'} ✨</h1>
          <p className="text-brand-100 text-lg max-w-xl">Manage your digital proof of work portfolio, track your progress, and build your verifiable reputation.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-brand-200 dark:hover:border-brand-800 transition-colors stagger-1 animate-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              Profile completion
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{completion}%</p>
            <Progress value={completion} />
          </CardContent>
        </Card>
        
        <Card className="hover:border-brand-200 dark:hover:border-brand-800 transition-colors stagger-2 animate-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              Total Projects
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 flex items-center justify-center">
                <span className="text-lg">🚀</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{projectCount}</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-brand-200 dark:hover:border-brand-800 transition-colors stagger-3 animate-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              Certificates
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{certificateCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
