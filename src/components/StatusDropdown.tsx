import { useState, useRef, useEffect } from 'react';
import type { Status } from '../types';

interface StatusDropdownProps {
  currentStatus: Status;
  onChange: (status: Status) => void;
}

const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

const statusColors: Record<Status, { bg: string; text: string; dot: string }> = {
  'To Do': { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'In Review': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  Done: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

export default function StatusDropdown({ currentStatus, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const c = statusColors[currentStatus];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200
          ${c.bg} ${c.text} hover:opacity-80
        `}
      >
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        {currentStatus}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 slide-in">
          {STATUSES.map((status) => {
            const sc = statusColors[status];
            const isActive = status === currentStatus;
            return (
              <button
                key={status}
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-150
                  ${isActive ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className={sc.text}>{status}</span>
                {isActive && (
                  <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
