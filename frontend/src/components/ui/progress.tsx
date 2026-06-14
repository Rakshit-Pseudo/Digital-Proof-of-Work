import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800', className)}>
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500 ease-in-out dark:from-brand-600 dark:to-violet-600"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12" />
      </div>
    </div>
  );
}
