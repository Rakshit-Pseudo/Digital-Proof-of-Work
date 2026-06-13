'use client';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = 'h-8 w-8' }: LoadingSpinnerProps) {
  return (
    <div className={`animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 ${className}`} />
  );
}
