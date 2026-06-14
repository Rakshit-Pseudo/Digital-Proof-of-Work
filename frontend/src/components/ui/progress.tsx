import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800', className)}>
      <div
        className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
