'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { tokenStorage } from '@/lib/auth-storage';
import { certificateSchema, type CertificateForm } from '@/lib/schemas';
import type { ApiResponse, Certificate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function CertificatesPage() {
  const queryClient = useQueryClient();
  const user = tokenStorage.getUser();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Certificate[]>>(`/certificates/user/${user?.id}`);
      return res.data.data;
    },
    enabled: !!user?.id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CertificateForm>({
    resolver: zodResolver(certificateSchema),
  });

  const addCertificate = useMutation({
    mutationFn: async (data: CertificateForm) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('issuingOrganization', data.issuingOrganization);
      formData.append('issueDate', data.issueDate);
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
      if (file) formData.append('certificateFile', file);

      return api.post('/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', user?.id] });
      setIsAdding(false);
      reset();
      setFile(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const deleteCertificate = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/certificates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', user?.id] });
    },
  });

  const onSubmit = (data: CertificateForm) => {
    setError('');
    addCertificate.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 animate-pulse">Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Certificates</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your verifiable credentials and achievements</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Certificate
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="max-w-2xl border-2 border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle>New Certificate</CardTitle>
            <CardDescription>Upload a new certificate to your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              
              <div className="space-y-2">
                <Label htmlFor="title">Certificate Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuingOrganization">Issuing Organization</Label>
                <Input id="issuingOrganization" {...register('issuingOrganization')} />
                {errors.issuingOrganization && <p className="text-sm text-red-600">{errors.issuingOrganization.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input id="issueDate" type="date" {...register('issueDate')} />
                  {errors.issueDate && <p className="text-sm text-red-600">{errors.issueDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                  <Input id="expiryDate" type="date" {...register('expiryDate')} />
                  {errors.expiryDate && <p className="text-sm text-red-600">{errors.expiryDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificateFile">Certificate Document/Image (optional)</Label>
                <Input 
                  id="certificateFile" 
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || addCertificate.isPending}>
                  {isSubmitting || addCertificate.isPending ? 'Saving...' : 'Save Certificate'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!certificates || certificates.length === 0 ? (
        !isAdding && (
          <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="w-20 h-20 bg-brand-100 dark:bg-brand-500/20 text-brand-600 rounded-full flex items-center justify-center mb-6">
              <Award className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl mb-2">No certificates yet</CardTitle>
            <CardDescription className="text-base max-w-sm mx-auto mb-8">
              Add your verified certificates to showcase your skills and achievements to recruiters.
            </CardDescription>
            <Button size="lg" onClick={() => setIsAdding(true)}>Add Certificate</Button>
          </Card>
        )
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert: Certificate, index: number) => (
            <Card key={cert._id} className={cn("flex flex-col overflow-hidden group", `stagger-${(index % 4) + 1}`)}>
              <CardHeader className="bg-gradient-to-r from-brand-50/50 to-violet-50/50 dark:from-brand-950/20 dark:to-violet-950/20 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="mb-3 flex items-center gap-2 text-brand-600 dark:text-brand-400">
                  <div className="p-2 bg-brand-100 dark:bg-brand-900/50 rounded-lg">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wider">{cert.issuer || (cert as any).issuingOrganization}</span>
                </div>
                <CardTitle className="line-clamp-2 text-xl group-hover:text-brand-600 transition-colors">{cert.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-medium text-zinc-900 dark:text-zinc-300">Issued</span>
                    <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>
                  {cert.expiryDate && (
                    <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="font-medium text-zinc-900 dark:text-zinc-300">Expires</span>
                      <span>{new Date(cert.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {cert.file && (
                  <div className="mt-6">
                    <a 
                      href={cert.file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Credential Document
                    </a>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-zinc-100 dark:border-zinc-800/60 p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this certificate?')) {
                      deleteCertificate.mutate(cert._id);
                    }
                  }}
                  disabled={deleteCertificate.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Certificate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
