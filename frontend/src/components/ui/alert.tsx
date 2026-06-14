import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}

export function Alert({ variant = 'default', children, className, icon = true }: AlertProps) {
  const icons = {
    default: <AlertCircle className="h-5 w-5" />,
    destructive: <XCircle className="h-5 w-5" />,
    success: <CheckCircle2 className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-xl border p-4 text-sm flex gap-3 items-start animate-in',
        variant === 'destructive' && 'border-red-200/50 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200',
        variant === 'success' && 'border-emerald-200/50 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-200',
        variant === 'info' && 'border-blue-200/50 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-200',
        variant === 'default' && 'border-zinc-200/50 bg-zinc-50 text-zinc-800 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-200',
        className
      )}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>}
      <div className="flex-1">{children}</div>
    </div>
  );
}
