import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef } from 'react';
import type { Task, Filters, SortConfig, ViewType, Status, Priority } from './types';
import { generateTasks } from './seedData';

interface State {
  tasks: Task[];
  filters: Filters;
  sort: SortConfig;
  view: ViewType;
}

type Action =
  | { type: 'MOVE_TASK'; taskId: string; newStatus: Status }
  | { type: 'SET_FILTERS'; filters: Partial<Filters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; sort: SortConfig }
  | { type: 'SET_VIEW'; view: ViewType };

const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const emptyFilters: Filters = {
  status: [],
  priority: [],
  assignee: [],
  dateFrom: '',
  dateTo: '',
};

function parseFiltersFromURL(): { filters: Partial<Filters>; view?: ViewType } {
  const params = new URLSearchParams(window.location.search);
  const result: { filters: Partial<Filters>; view?: ViewType } = { filters: {} };

  const status = params.get('status');
  if (status) result.filters.status = status.split(',') as Status[];

  const priority = params.get('priority');
  if (priority) result.filters.priority = priority.split(',') as Priority[];

  const assignee = params.get('assignee');
  if (assignee) result.filters.assignee = assignee.split(',');

  const dateFrom = params.get('dateFrom');
  if (dateFrom) result.filters.dateFrom = dateFrom;

  const dateTo = params.get('dateTo');
  if (dateTo) result.filters.dateTo = dateTo;

  const view = params.get('view') as ViewType | null;
  if (view && ['kanban', 'list', 'timeline'].includes(view)) {
    result.view = view;
  }

  return result;
}

function syncFiltersToURL(filters: Filters, view: ViewType) {
  const params = new URLSearchParams();

  if (filters.status.length > 0) params.set('status', filters.status.join(','));
  if (filters.priority.length > 0) params.set('priority', filters.priority.join(','));
  if (filters.assignee.length > 0) params.set('assignee', filters.assignee.join(','));
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (view !== 'kanban') params.set('view', view);

  const search = params.toString();
  const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
  window.history.replaceState(null, '', newUrl);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, status: action.newStatus } : t
        ),
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { ...emptyFilters },
      };
    case 'SET_SORT':
      return {
        ...state,
        sort: action.sort,
      };
    case 'SET_VIEW':
      return {
        ...state,
        view: action.view,
      };
    default:
      return state;
  }
}

// Lazy initializer — avoids calling generateTasks during module evaluation
function createInitialState(): State {
  const urlState = parseFiltersFromURL();
  return {
    tasks: generateTasks(500),
    filters: { ...emptyFilters, ...urlState.filters },
    sort: { field: 'dueDate', direction: 'asc' },
    view: urlState.view || 'kanban',
  };
}

interface TaskContextType {
  state: State;
  filteredTasks: Task[];
  sortedTasks: Task[];
  tasksByStatus: Record<Status, Task[]>;
  dispatch: React.Dispatch<Action>;
  hasActiveFilters: boolean;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialization — generateTasks only runs once, not on every render
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Debounce URL sync to avoid repeated replaceState calls
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncFiltersToURL(state.filters, state.view);
    }, 100);
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [state.filters, state.view]);

  // Listen for popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const { filters, view } = parseFiltersFromURL();
      dispatch({ type: 'SET_FILTERS', filters: { ...emptyFilters, ...filters } });
      if (view) dispatch({ type: 'SET_VIEW', view });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const filteredTasks = useMemo(() => {
    const { status, priority, assignee, dateFrom, dateTo } = state.filters;
    const hasStatus = status.length > 0;
    const hasPriority = priority.length > 0;
    const hasAssignee = assignee.length > 0;

    // Fast path: no filters active
    if (!hasStatus && !hasPriority && !hasAssignee && !dateFrom && !dateTo) {
      return state.tasks;
    }

    // Use Sets for O(1) lookups instead of array.includes
    const statusSet = hasStatus ? new Set(status) : null;
    const prioritySet = hasPriority ? new Set(priority) : null;
    const assigneeSet = hasAssignee ? new Set(assignee) : null;

    return state.tasks.filter((task) => {
      if (statusSet && !statusSet.has(task.status)) return false;
      if (prioritySet && !prioritySet.has(task.priority)) return false;
      if (assigneeSet && !assigneeSet.has(task.assignee.id)) return false;
      if (dateFrom && task.dueDate < dateFrom) return false;
      if (dateTo && task.dueDate > dateTo) return false;
      return true;
    });
  }, [state.tasks, state.filters]);

  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    const { field, direction } = state.sort;
    const mult = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (field) {
        case 'title':
          return mult * a.title.localeCompare(b.title);
        case 'priority':
          return mult * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        case 'dueDate':
          return mult * (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0);
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredTasks, state.sort]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Status, Task[]> = {
      'To Do': [],
      'In Progress': [],
      'In Review': [],
      Done: [],
    };
    for (let i = 0; i < filteredTasks.length; i++) {
      grouped[filteredTasks[i].status].push(filteredTasks[i]);
    }
    return grouped;
  }, [filteredTasks]);

  const hasActiveFilters = useMemo(() => {
    const f = state.filters;
    return (
      f.status.length > 0 ||
      f.priority.length > 0 ||
      f.assignee.length > 0 ||
      f.dateFrom !== '' ||
      f.dateTo !== ''
    );
  }, [state.filters]);

  const value = useMemo(
    () => ({
      state,
      filteredTasks,
      sortedTasks,
      tasksByStatus,
      dispatch,
      hasActiveFilters,
    }),
    [state, filteredTasks, sortedTasks, tasksByStatus, dispatch, hasActiveFilters]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTaskContext must be used within TaskProvider');
  return context;
}
