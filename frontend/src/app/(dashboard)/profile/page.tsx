'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { profileSchema, type ProfileForm } from '@/lib/schemas';
import type { ApiResponse, Profile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Profile>>('/profiles/me');
      return res.data.data;
    },
    retry: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      headline: profile?.headline || '',
      bio: profile?.bio || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileForm) => {
      // If profile exists, PATCH, else POST
      if (profile) {
        return api.patch('/profiles/me', data);
      }
      return api.post('/profiles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await api.post('/profiles/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      setSuccess('Avatar updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: ProfileForm) => {
    setError('');
    updateProfile.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-zinc-500">Manage your public information</p>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert className="bg-green-50 text-green-700 border-green-200">{success}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-200">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={uploadAvatar}
              className="hidden"
              accept="image/*"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !profile}
            >
              {uploading ? 'Uploading...' : 'Change avatar'}
            </Button>
            {!profile && <p className="mt-2 text-sm text-zinc-500">Please save your profile first before uploading an avatar.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" placeholder="e.g. Full-stack Developer | Computer Science Student" {...register('headline')} />
              {errors.headline && <p className="text-sm text-red-600">{errors.headline.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us a little bit about yourself" 
                className="min-h-[120px]"
                {...register('bio')} 
              />
              {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting || updateProfile.isPending}>
              {isSubmitting || updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
