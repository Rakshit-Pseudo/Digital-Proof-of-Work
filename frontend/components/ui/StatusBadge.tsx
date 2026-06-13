'use client';

import { statusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge capitalize ${statusColor(status)}`}>
      {status}
    </span>
  );
}
