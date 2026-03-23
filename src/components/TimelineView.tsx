import { useMemo } from 'react';
import { useTaskContext } from '../TaskContext';
import type { Task, Priority } from '../types';

const PRIORITY_COLORS: Record<Priority, { bar: string; text: string }> = {
  Critical: { bar: '#ef4444', text: '#991b1b' },
  High: { bar: '#f97316', text: '#9a3412' },
  Medium: { bar: '#eab308', text: '#854d0e' },
  Low: { bar: '#22c55e', text: '#166534' },
};

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 50;
const DAY_WIDTH = 42;
const LABEL_WIDTH = 260;

export default function TimelineView() {
  const { filteredTasks } = useTaskContext();

  const { days, monthLabel, todayIndex } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const d: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      d.push(new Date(year, month, i));
    }
    const todayIdx = now.getDate() - 1;
    const label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { days: d, monthLabel: label, todayIndex: todayIdx };
  }, []);

  const tasksInRange = useMemo(() => {
    const monthStart = days[0];
    const monthEnd = days[days.length - 1];

    const result: typeof filteredTasks = [];
    for (let i = 0; i < filteredTasks.length && result.length < 100; i++) {
      const task = filteredTasks[i];
      const due = new Date(task.dueDate + 'T00:00:00');
      const start = task.startDate ? new Date(task.startDate + 'T00:00:00') : due;
      if (start <= monthEnd && due >= monthStart) {
        result.push(task);
      }
    }
    return result;
  }, [filteredTasks, days]);

  const getBarStyle = (task: Task) => {
    const monthStart = days[0];
    const due = new Date(task.dueDate + 'T00:00:00');
    const start = task.startDate ? new Date(task.startDate + 'T00:00:00') : null;

    if (!start) {
      // No start date: single-day marker on due date
      const dayIndex = Math.floor(
        (due.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        left: Math.max(0, dayIndex) * DAY_WIDTH,
        width: DAY_WIDTH,
        isSingleDay: true,
      };
    }

    const startDayIndex = Math.max(
      0,
      Math.floor((start.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const endDayIndex = Math.min(
      days.length - 1,
      Math.floor((due.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      left: startDayIndex * DAY_WIDTH,
      width: Math.max(DAY_WIDTH, (endDayIndex - startDayIndex + 1) * DAY_WIDTH),
      isSingleDay: false,
    };
  };

  const totalWidth = days.length * DAY_WIDTH;
  const totalHeight = HEADER_HEIGHT + tasksInRange.length * ROW_HEIGHT + 20;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Month label */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{monthLabel}</h3>
        <span className="text-xs text-slate-400 font-medium">
          {tasksInRange.length} tasks
        </span>
      </div>

      {/* Scrollable area */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="flex" style={{ minWidth: `${LABEL_WIDTH + totalWidth}px` }}>
          {/* Task labels column */}
          <div
            className="sticky left-0 bg-white z-20 border-r border-slate-200"
            style={{ width: `${LABEL_WIDTH}px`, minWidth: `${LABEL_WIDTH}px` }}
          >
            {/* Header spacer */}
            <div
              className="border-b border-slate-200 bg-slate-50 px-3 flex items-center"
              style={{ height: `${HEADER_HEIGHT}px` }}
            >
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Task
              </span>
            </div>

            {/* Task rows */}
            {tasksInRange.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 px-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority].bar }}
                />
                <span className="text-xs font-medium text-slate-700 truncate">
                  {task.title}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="relative" style={{ width: `${totalWidth}px` }}>
            {/* Day headers */}
            <div
              className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10"
              style={{ height: `${HEADER_HEIGHT}px` }}
            >
              {days.map((day, i) => {
                const isToday = i === todayIndex;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center border-r border-slate-100 ${
                      isToday ? 'bg-blue-50' : isWeekend ? 'bg-slate-100/50' : ''
                    }`}
                    style={{ width: `${DAY_WIDTH}px`, minWidth: `${DAY_WIDTH}px` }}
                  >
                    <span
                      className={`text-[10px] font-medium ${
                        isToday ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      {day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'text-white bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center'
                          : 'text-slate-600'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Task rows with bars */}
            <div style={{ height: `${totalHeight - HEADER_HEIGHT}px` }}>
              {/* Grid lines */}
              {days.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-slate-50"
                  style={{ left: `${i * DAY_WIDTH}px`, width: '1px' }}
                />
              ))}

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 z-10"
                style={{
                  left: `${todayIndex * DAY_WIDTH + DAY_WIDTH / 2}px`,
                  width: '2px',
                  background: 'linear-gradient(to bottom, #3b82f6, #3b82f680)',
                }}
              >
                <div className="absolute -top-0.5 -left-1 w-2 h-2 rounded-full bg-blue-500" />
              </div>

              {/* Task bars */}
              {tasksInRange.map((task, rowIndex) => {
                const { left, width, isSingleDay } = getBarStyle(task);
                const colors = PRIORITY_COLORS[task.priority];

                return (
                  <div
                    key={task.id}
                    className="absolute"
                    style={{
                      top: `${rowIndex * ROW_HEIGHT + 8}px`,
                      left: `${left}px`,
                      width: `${width}px`,
                      height: `${ROW_HEIGHT - 16}px`,
                    }}
                  >
                    {isSingleDay ? (
                      <div
                        className="w-full h-full rounded-md border-2 border-dashed flex items-center justify-center"
                        style={{
                          borderColor: colors.bar,
                          backgroundColor: colors.bar + '15',
                        }}
                        title={`${task.title} (due ${task.dueDate})`}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors.bar }}
                        />
                      </div>
                    ) : (
                      <div
                        className="gantt-bar w-full h-full rounded-md flex items-center px-2 cursor-default"
                        style={{ backgroundColor: colors.bar + 'cc' }}
                        title={`${task.title} (${task.startDate} → ${task.dueDate})`}
                      >
                        <span className="text-[10px] font-semibold text-white truncate">
                          {task.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
