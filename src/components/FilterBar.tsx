import { useTaskContext } from '../TaskContext';
import MultiSelect from './MultiSelect';
import type { Status, Priority } from '../types';
import { USERS } from '../seedData';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const ASSIGNEE_OPTIONS = USERS.map((u) => ({ value: u.id, label: u.name }));

export default function FilterBar() {
  const { state, dispatch, hasActiveFilters } = useTaskContext();
  const { filters } = state;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mr-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
      </div>

      <MultiSelect
        label="Status"
        options={STATUS_OPTIONS}
        selected={filters.status}
        onChange={(val) => dispatch({ type: 'SET_FILTERS', filters: { status: val as Status[] } })}
      />

      <MultiSelect
        label="Priority"
        options={PRIORITY_OPTIONS}
        selected={filters.priority}
        onChange={(val) =>
          dispatch({ type: 'SET_FILTERS', filters: { priority: val as Priority[] } })
        }
      />

      <MultiSelect
        label="Assignee"
        options={ASSIGNEE_OPTIONS}
        selected={filters.assignee}
        onChange={(val) => dispatch({ type: 'SET_FILTERS', filters: { assignee: val } })}
      />

      <div className="flex items-center gap-2 text-sm">
        <label className="text-slate-500 font-medium">From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTERS', filters: { dateFrom: e.target.value } })
          }
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-sm bg-white hover:border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all duration-200"
        />
        <label className="text-slate-500 font-medium">To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTERS', filters: { dateTo: e.target.value } })
          }
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-sm bg-white hover:border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all duration-200"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 fade-in"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all
        </button>
      )}
    </div>
  );
}
