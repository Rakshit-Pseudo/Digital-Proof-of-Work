import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success';
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = 'default', children, className }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        variant === 'destructive' && 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
        variant === 'success' && 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200',
        variant === 'default' && 'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
        className
      )}
    >
      {children}
    </div>
  );
}
