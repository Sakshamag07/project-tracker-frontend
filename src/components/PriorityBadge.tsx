import type { Priority } from '../types';
import React from 'react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

const config: Record<Priority, { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const PriorityBadge = React.memo(function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const c = config[priority];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 ${c.bg} ${c.text} ${sizeClass} rounded-full font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {priority}
    </span>
  );
});

export default PriorityBadge;
