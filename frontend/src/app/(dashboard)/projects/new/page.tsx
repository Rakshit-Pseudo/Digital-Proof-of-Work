'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { projectSchema, type ProjectForm } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectForm) => {
    setError('');
    
    // We send form data because of file uploads
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('techStack', data.techStack);
    if (data.githubUrl) formData.append('githubUrl', data.githubUrl);
    if (file) formData.append('projectFiles', file);

    try {
      await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/projects');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Project</h1>
        <p className="text-zinc-500">Add a new project to your portfolio</p>
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
              <Label htmlFor="projectFiles">Project Image (optional)</Label>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
