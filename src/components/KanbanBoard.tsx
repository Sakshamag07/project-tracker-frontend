import { useTaskContext } from '../TaskContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import TaskCard from './TaskCard';
import type { Status, CollaborationUser } from '../types';
import React, { useCallback, useState, useMemo } from 'react';

const COLUMNS: { status: Status; dotColor: string }[] = [
  { status: 'To Do', dotColor: 'bg-slate-400' },
  { status: 'In Progress', dotColor: 'bg-blue-500' },
  { status: 'In Review', dotColor: 'bg-purple-500' },
  { status: 'Done', dotColor: 'bg-green-500' },
];

const INITIAL_VISIBLE = 20;
const LOAD_MORE_COUNT = 20;

interface KanbanBoardProps {
  getTaskCollaborators: (taskId: string) => CollaborationUser[];
}

interface ColumnProps {
  status: Status;
  dotColor: string;
  tasks: ReturnType<typeof useTaskContext>['tasksByStatus']['To Do'];
  isHovered: boolean;
  getTaskCollaborators: (taskId: string) => CollaborationUser[];
  handlePointerDown: (e: React.PointerEvent, taskId: string, status: Status) => void;
}

const KanbanColumn = React.memo(function KanbanColumn({
  status,
  dotColor,
  tasks,
  isHovered,
  getTaskCollaborators,
  handlePointerDown,
}: ColumnProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  // Incrementally render tasks to avoid blocking the initial paint (TBT/LCP optimization)
  React.useEffect(() => {
    if (visibleCount < INITIAL_VISIBLE && visibleCount < tasks.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + 5, INITIAL_VISIBLE, tasks.length));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, tasks.length]);

  const visibleTasks = useMemo(
    () => tasks.slice(0, visibleCount),
    [tasks, visibleCount]
  );
  const hasMore = tasks.length > visibleCount;

  return (
    <div
      data-column-status={status}
      className={`
        kanban-column flex flex-col rounded-2xl min-h-0
        ${isHovered ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : 'bg-slate-50/80'}
      `}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h2 className="text-sm font-semibold text-slate-700">{status}</h2>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md">
          {tasks.length}
        </span>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400">No tasks</p>
            <p className="text-xs text-slate-300 mt-1">Drag tasks here</p>
          </div>
        ) : (
          <>
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                collaborators={getTaskCollaborators(task.id)}
                onPointerDown={handlePointerDown}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
                className="w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Show {Math.min(LOAD_MORE_COUNT, tasks.length - visibleCount)} more ({tasks.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default function KanbanBoard({ getTaskCollaborators }: KanbanBoardProps) {
  const { tasksByStatus, dispatch } = useTaskContext();

  const handleDrop = useCallback(
    (taskId: string, newStatus: Status) => {
      dispatch({ type: 'MOVE_TASK', taskId, newStatus });
    },
    [dispatch]
  );

  const { dragState, hoveredColumn, handlePointerDown, handlePointerMove, handlePointerUp } =
    useDragAndDrop(handleDrop);

  return (
    <div
      className="flex gap-5 h-[calc(100vh-220px)] overflow-x-auto pb-4"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {COLUMNS.map(({ status, dotColor }) => (
        <KanbanColumn
          key={status}
          status={status}
          dotColor={dotColor}
          tasks={tasksByStatus[status]}
          isHovered={dragState.isDragging && hoveredColumn === status}
          getTaskCollaborators={getTaskCollaborators}
          handlePointerDown={handlePointerDown}
        />
      ))}
    </div>
  );
}
