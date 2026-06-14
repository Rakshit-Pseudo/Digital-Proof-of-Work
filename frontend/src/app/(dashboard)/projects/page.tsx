'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FolderKanban, Trash2, Edit } from 'lucide-react';
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
    return <div className="p-8 text-center">Loading projects...</div>;
  }

  const projects = data?.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-zinc-500">Manage your portfolio projects</p>
        </div>
        <Link href="/projects/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <FolderKanban className="mb-4 h-12 w-12 text-zinc-300" />
          <CardTitle className="mb-2">No projects yet</CardTitle>
          <CardDescription className="mb-6">
            Get started by creating your first portfolio project.
          </CardDescription>
          <Link href="/projects/new" className={buttonVariants()}>Create Project</Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <Card key={project._id} className="flex flex-col overflow-hidden">
              {project.files?.[0] && (
                <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                  <img
                    src={project.files[0].url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-1 text-xl">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Link href={`/projects/${project._id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
