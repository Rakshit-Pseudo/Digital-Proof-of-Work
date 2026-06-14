'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const { token } = use(params);

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err) {
        setError(getErrorMessage(err));
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Your email has been successfully verified!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center p-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-zinc-900"></div>
            </div>
          )}
          
          {status === 'success' && (
            <Link href="/login" className={buttonVariants({ className: 'mt-4' })}>
              Go to Login
            </Link>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">{error}</Alert>
              <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                Back to Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
