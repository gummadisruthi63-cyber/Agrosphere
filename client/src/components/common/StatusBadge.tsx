import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toLowerCase().trim();

  // Status mapping
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['healthy', 'active', 'paid', 'completed', 'in stock', 'present'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['lactating', 'wholesale / distributor', 'scheduled', 'half day'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['pregnant', 'expected calving', 'inseminated'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (['low stock', 'partially paid', 'alert', 'monitoring', 'under treatment', 'on leave'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['sick', 'critical', 'pending', 'out of stock', 'expired', 'overdue', 'absent', 'deceased', 'terminated'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['dry', 'heifer', 'calf'].includes(normalized)) {
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
