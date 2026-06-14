'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/lib/auth-storage';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return <>{children}</>;
}
