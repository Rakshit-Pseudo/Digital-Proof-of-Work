'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { tokenStorage } from '@/lib/auth-storage';
import type { ApiResponse, PaginatedProjects, Profile, Certificate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const user = tokenStorage.getUser();

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Profile>>('/profiles/me');
      return res.data.data;
    },
    retry: false,
    throwOnError: false,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedProjects>>(`/projects/user/${user!.id}`);
      return res.data.data;
    },
    enabled: Boolean(user?.id),
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Certificate[]>>(`/certificates/user/${user!.id}`);
      return res.data.data;
    },
    enabled: Boolean(user?.id),
  });

  const completion = profile?.profileCompletionPercentage ?? 0;
  const projectCount = projectsData?.pagination.total ?? 0;
  const certificateCount = certificates?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Student'}</h1>
        <p className="text-zinc-500">Manage your digital proof of work portfolio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{completion}%</p>
            <Progress value={completion} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projectCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{certificateCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
