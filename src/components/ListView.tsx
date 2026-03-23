import { useTaskContext } from '../TaskContext';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { getDueDateInfo } from './TaskCard';
import Avatar from './Avatar';
import PriorityBadge from './PriorityBadge';
import StatusDropdown from './StatusDropdown';
import type { SortField, CollaborationUser } from '../types';
import { useCallback } from 'react';

const ROW_HEIGHT = 56;

interface ListViewProps {
  getTaskCollaborators: (taskId: string) => CollaborationUser[];
}

export default function ListView({ getTaskCollaborators }: ListViewProps) {
  const { sortedTasks, state, dispatch, hasActiveFilters } = useTaskContext();
  const { sort } = state;

  const containerHeight = Math.min(window.innerHeight - 260, 700);

  const { visibleItems, totalHeight, containerRef, handleScroll } = useVirtualScroll({
    itemCount: sortedTasks.length,
    itemHeight: ROW_HEIGHT,
    containerHeight,
    overscan: 5,
  });

  const handleSort = useCallback(
    (field: SortField) => {
      const newDirection =
        sort.field === field ? (sort.direction === 'asc' ? 'desc' : 'asc') : 'asc';
      dispatch({ type: 'SET_SORT', sort: { field, direction: newDirection } });
    },
    [sort, dispatch]
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sort.field === field;
    return (
      <span className={`ml-1 inline-flex ${isActive ? 'text-blue-500' : 'text-slate-300'}`}>
        {isActive ? (
          sort.direction === 'asc' ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </span>
    );
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No tasks found</h3>
        <p className="text-sm text-slate-400 mb-4">No tasks match your current filters</p>
        {hasActiveFilters && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Table header */}
      <div
        className="grid items-center px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider"
        style={{ gridTemplateColumns: '2fr 120px 100px 100px 120px 60px' }}
      >
        <button
          onClick={() => handleSort('title')}
          className="flex items-center gap-1 text-left hover:text-slate-700 transition-colors"
        >
          Task <SortIcon field="title" />
        </button>
        <span>Assignee</span>
        <button
          onClick={() => handleSort('priority')}
          className="flex items-center gap-1 text-left hover:text-slate-700 transition-colors"
        >
          Priority <SortIcon field="priority" />
        </button>
        <span>Status</span>
        <button
          onClick={() => handleSort('dueDate')}
          className="flex items-center gap-1 text-left hover:text-slate-700 transition-colors"
        >
          Due Date <SortIcon field="dueDate" />
        </button>
        <span></span>
      </div>

      {/* Virtual scrolling container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto"
        style={{ height: `${containerHeight}px` }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {visibleItems.map(({ index, offsetTop }) => {
            const task = sortedTasks[index];
            if (!task) return null;
            const { label, isOverdue, isDueToday } = getDueDateInfo(task.dueDate);
            const collabs = getTaskCollaborators(task.id);

            return (
              <div
                key={task.id}
                className="absolute left-0 right-0 grid items-center px-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                style={{
                  top: `${offsetTop}px`,
                  height: `${ROW_HEIGHT}px`,
                  gridTemplateColumns: '2fr 120px 100px 100px 120px 60px',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-slate-800 truncate">{task.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar user={task.assignee} size="sm" />
                  <span className="text-xs text-slate-500 truncate hidden lg:inline">
                    {task.assignee.name.split(' ')[0]}
                  </span>
                </div>

                <PriorityBadge priority={task.priority} size="sm" />

                <StatusDropdown
                  currentStatus={task.status}
                  onChange={(newStatus) =>
                    dispatch({ type: 'MOVE_TASK', taskId: task.id, newStatus })
                  }
                />

                <span
                  className={`text-xs font-medium ${
                    isOverdue
                      ? 'text-red-600'
                      : isDueToday
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>

                <div className="flex items-center -space-x-1">
                  {collabs.slice(0, 2).map((cu) => (
                    <div key={cu.user.id} className="collaboration-dot">
                      <Avatar user={cu.user} size="sm" />
                    </div>
                  ))}
                  {collabs.length > 2 && (
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 flex items-center justify-center ring-1 ring-white">
                      +{collabs.length - 2}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 font-medium">
        Showing {sortedTasks.length} tasks
      </div>
    </div>
  );
}
