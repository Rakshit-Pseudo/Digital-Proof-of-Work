'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FolderKanban, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, getErrorMessage } from '@/lib/api';
import { tokenStorage } from '@/lib/auth-storage';
import type { ApiResponse, PaginatedProjects, Project } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const user = tokenStorage.getUser();

  const { data, isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedProjects>>(`/projects/user/${user?.id}`);
      return res.data.data;
    },
    enabled: !!user?.id,
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 animate-pulse">Loading your amazing projects...</p>
      </div>
    );
  }

  const projects = data?.projects || [];

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Projects</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your portfolio projects and showcase your work</p>
        </div>
        <Link href="/projects/new" className={buttonVariants({ size: 'lg' })}>
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-500/20 text-brand-600 rounded-full flex items-center justify-center mb-6">
            <FolderKanban className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl mb-2">No projects yet</CardTitle>
          <CardDescription className="text-base max-w-sm mx-auto mb-8">
            Get started by creating your first portfolio project to showcase your skills to the world.
          </CardDescription>
          <Link href="/projects/new" className={buttonVariants({ size: 'lg' })}>Create Project</Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project: Project, index: number) => (
            <Card key={project._id} className={cn("flex flex-col overflow-hidden group", `stagger-${(index % 4) + 1}`)}>
              {project.files?.[0] ? (
                <div className="aspect-video w-full overflow-hidden bg-zinc-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src={project.files[0].url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-900/40 dark:to-violet-900/40 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <FolderKanban className="h-12 w-12 text-brand-400/50" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-1 text-xl group-hover:text-brand-600 transition-colors">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {(project.techStack || []).map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-zinc-100/80 hover:bg-zinc-200 dark:bg-zinc-800/80">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/60 p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Link href={`/projects/${project._id}`} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400' })}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this project?')) {
                      deleteProject.mutate(project._id);
                    }
                  }}
                  disabled={deleteProject.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
