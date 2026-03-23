export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type ViewType = 'kanban' | 'list' | 'timeline';
export type SortField = 'title' | 'priority' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: User;
  startDate: string | null;
  dueDate: string;
  createdAt: string;
}

export interface Filters {
  status: Status[];
  priority: Priority[];
  assignee: string[];
  dateFrom: string;
  dateTo: string;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface CollaborationUser {
  user: User;
  currentTaskId: string;
}
