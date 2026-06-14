'use client';

import { User, UserRole, ROLE_ROUTES } from '@/types';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getDashboardRoute = (role: UserRole): string => ROLE_ROUTES[role] || '/dashboard/student';

export const hasRole = (user: User | null, ...roles: UserRole[]): boolean =>
  !!user && roles.includes(user.role);
