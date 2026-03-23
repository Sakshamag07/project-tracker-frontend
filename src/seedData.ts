import type { Task, User, Priority, Status } from './types';

const USERS: User[] = [
  { id: 'u1', name: 'Alice Martin', color: '#3b82f6' },
  { id: 'u2', name: 'Bob Chen', color: '#8b5cf6' },
  { id: 'u3', name: 'Carol Davis', color: '#ec4899' },
  { id: 'u4', name: 'David Kim', color: '#f97316' },
  { id: 'u5', name: 'Eva Lopez', color: '#14b8a6' },
  { id: 'u6', name: 'Frank Wu', color: '#6366f1' },
];

export const COLLABORATION_USERS: User[] = [
  { id: 'collab1', name: 'Sarah J', color: '#06b6d4' },
  { id: 'collab2', name: 'Mike R', color: '#f43f5e' },
  { id: 'collab3', name: 'Priya K', color: '#a855f7' },
  { id: 'collab4', name: 'Tom B', color: '#84cc16' },
];

const ADJECTIVES = [
  'Design', 'Implement', 'Review', 'Update', 'Fix', 'Optimize', 'Refactor',
  'Build', 'Create', 'Deploy', 'Test', 'Configure', 'Migrate', 'Integrate',
  'Document', 'Research', 'Analyze', 'Plan', 'Launch', 'Monitor',
];

const NOUNS = [
  'authentication flow', 'dashboard UI', 'API endpoints', 'database schema',
  'user onboarding', 'payment system', 'notification service', 'search feature',
  'analytics module', 'caching layer', 'CI/CD pipeline', 'error handling',
  'landing page', 'email templates', 'file upload', 'data export',
  'admin panel', 'rate limiting', 'security audit', 'performance tests',
  'mobile layout', 'dark mode', 'accessibility', 'localization',
  'webhook handler', 'SSO integration', 'logging system', 'backup service',
  'REST API', 'GraphQL schema', 'unit tests', 'integration tests',
];

const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

// Use seeded pseudo-random for deterministic, fast generation
// Simple mulberry32 PRNG — avoids expensive Math.random() overhead
let _seed = 42;
function fastRandom(): number {
  _seed = (_seed + 0x6D2B79F5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function fastPick<T>(arr: T[]): T {
  return arr[(fastRandom() * arr.length) | 0];
}

// Pre-compute date strings to avoid repeated Date object creation
function buildDateCache(): { today: string; todayMs: number; dates: string[] } {
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const today = formatDateFast(todayMs);

  // Pre-generate 90 days of date strings (past 30 + future 60)
  const dates: string[] = [];
  const baseMs = todayMs - 30 * 86400000;
  for (let i = 0; i < 90; i++) {
    dates.push(formatDateFast(baseMs + i * 86400000));
  }
  return { today, todayMs, dates };
}

function formatDateFast(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`;
}

export function generateTasks(count: number = 500): Task[] {
  _seed = 42; // Reset seed for deterministic output
  const tasks: Task[] = new Array(count);
  const { dates } = buildDateCache();

  for (let i = 0; i < count; i++) {
    const hasStartDate = fastRandom() > 0.15;
    const isOverdue = fastRandom() < 0.2;
    const isDueToday = !isOverdue && fastRandom() < 0.05;

    let dueDateIdx: number;
    let startDateIdx: number | null = null;

    if (isDueToday) {
      dueDateIdx = 30; // today index in dates array
    } else if (isOverdue) {
      dueDateIdx = 16 + ((fastRandom() * 14) | 0); // 1-14 days ago (idx 16-29)
    } else {
      dueDateIdx = 31 + ((fastRandom() * 59) | 0); // future dates
    }

    // Clamp to valid range
    dueDateIdx = Math.min(dueDateIdx, dates.length - 1);

    if (hasStartDate) {
      startDateIdx = Math.max(0, dueDateIdx - 1 - ((fastRandom() * 20) | 0));
    }

    tasks[i] = {
      id: `task-${i + 1}`,
      title: `${fastPick(ADJECTIVES)} ${fastPick(NOUNS)}`,
      status: fastPick(STATUSES),
      priority: fastPick(PRIORITIES),
      assignee: fastPick(USERS),
      startDate: startDateIdx !== null ? dates[startDateIdx] : null,
      dueDate: dates[dueDateIdx],
      createdAt: dates[((fastRandom() * 30) | 0)],
    };
  }

  return tasks;
}

export { USERS };
