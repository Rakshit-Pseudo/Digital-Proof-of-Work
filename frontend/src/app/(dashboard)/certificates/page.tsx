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
    return <div className="p-8 text-center">Loading certificates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-zinc-500">Manage your verifiable credentials</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
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
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <Award className="mb-4 h-12 w-12 text-zinc-300" />
            <CardTitle className="mb-2">No certificates yet</CardTitle>
            <CardDescription className="mb-6">
              Add certificates to showcase your skills and achievements.
            </CardDescription>
            <Button onClick={() => setIsAdding(true)}>Add Certificate</Button>
          </Card>
        )
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert: Certificate) => (
            <Card key={cert._id} className="flex flex-col overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2 text-zinc-500">
                  <Award className="h-5 w-5" />
                  <span className="text-sm font-medium">{cert.issuingOrganization}</span>
                </div>
                <CardTitle className="line-clamp-2 text-lg">{cert.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm text-zinc-600">
                  <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                  {cert.expiryDate && (
                    <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                  )}
                </div>
                {cert.file && (
                  <div className="mt-4">
                    <a 
                      href={cert.file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View Credential
                    </a>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this certificate?')) {
                      deleteCertificate.mutate(cert._id);
                    }
                  }}
                  disabled={deleteCertificate.isPending}
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
