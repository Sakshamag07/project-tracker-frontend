import type { Task, Status, CollaborationUser } from '../types';
import Avatar from './Avatar';
import PriorityBadge from './PriorityBadge';
import React from 'react';

interface TaskCardProps {
  task: Task;
  collaborators?: CollaborationUser[];
  onPointerDown?: (e: React.PointerEvent, taskId: string, status: Status) => void;
}

function getDueDateInfo(dueDate: string): { label: string; isOverdue: boolean; isDueToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Due Today', isOverdue: false, isDueToday: true };
  } else if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays > 7) {
      return { label: `${absDays} days overdue`, isOverdue: true, isDueToday: false };
    }
    return { label: `${absDays}d overdue`, isOverdue: true, isDueToday: false };
  } else {
    return {
      label: new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      isOverdue: false,
      isDueToday: false,
    };
  }
}

const TaskCard = React.memo(function TaskCard({ task, collaborators = [], onPointerDown }: TaskCardProps) {
  const { label, isOverdue, isDueToday } = getDueDateInfo(task.dueDate);

  return (
    <div
      className={`
        bg-white rounded-xl border p-4 cursor-grab active:cursor-grabbing
        select-none group
        ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
      `}
      onPointerDown={(e) => onPointerDown?.(e, task.id, task.status)}
      style={{ touchAction: 'none' }}
    >
      {/* Priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <PriorityBadge priority={task.priority} size="sm" />
        {collaborators.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {collaborators.slice(0, 2).map((cu) => (
              <div key={cu.user.id} className="collaboration-dot">
                <Avatar user={cu.user} size="sm" />
              </div>
            ))}
            {collaborators.length > 2 && (
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                +{collaborators.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 mb-3 leading-snug line-clamp-2">
        {task.title}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Avatar user={task.assignee} size="sm" />
        <span
          className={`
            text-xs font-medium px-2 py-0.5 rounded-md
            ${
              isOverdue
                ? 'text-red-600 bg-red-100'
                : isDueToday
                ? 'text-amber-600 bg-amber-100'
                : 'text-slate-500 bg-slate-100'
            }
          `}
        >
          {label}
        </span>
      </div>
    </div>
  );
});

export default TaskCard;
export { getDueDateInfo };
