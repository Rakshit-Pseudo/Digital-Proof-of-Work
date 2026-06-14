'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, icon, color = 'bg-brand-50 text-brand-600' }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
        </div>
        {icon && <div className={`p-2 rounded-lg ${color}`}>{icon}</div>}
      </div>
    </div>
  );
}
