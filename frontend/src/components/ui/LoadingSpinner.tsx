'use client';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = 'h-8 w-8' }: LoadingSpinnerProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full border-[3px] border-zinc-100 dark:border-zinc-800" />
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brand-500 border-r-violet-500 animate-spin" />
    </div>
  );
}
