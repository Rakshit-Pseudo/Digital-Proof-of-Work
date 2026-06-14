'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { projectSchema, type ProjectForm } from '@/lib/schemas';
import type { ApiResponse, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        techStack: (project.techStack || []).join(', '),
        githubUrl: project.githubUrl || '',
      });
    }
  }, [project, reset]);

  const updateProject = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('techStack', data.techStack);
      if (data.githubUrl) formData.append('githubUrl', data.githubUrl);
      if (file) formData.append('projectFiles', file);

      return api.patch(`/projects/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      router.push('/projects');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const onSubmit = (data: ProjectForm) => {
    setError('');
    updateProject.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading project details...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-zinc-500">Update your portfolio project</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="min-h-[120px]" {...register('description')} />
              {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
              <Input id="techStack" placeholder="React, Node.js, MongoDB" {...register('techStack')} />
              {errors.techStack && <p className="text-sm text-red-600">{errors.techStack.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
              <Input id="githubUrl" type="url" {...register('githubUrl')} />
              {errors.githubUrl && <p className="text-sm text-red-600">{errors.githubUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectFiles">Update Project Image (optional)</Label>
              {project?.files?.[0] && !file && (
                <div className="mb-2 h-32 w-48 overflow-hidden rounded-md border">
                  <img src={project.files[0].url} alt="Current project" className="h-full w-full object-cover" />
                </div>
              )}
              <Input
                id="projectFiles"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/projects')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || updateProject.isPending}>
                {isSubmitting || updateProject.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
