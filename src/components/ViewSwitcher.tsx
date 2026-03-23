import type { ViewType } from '../types';

interface ViewSwitcherProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
}

const views: { value: ViewType; label: string; icon: string }[] = [
  {
    value: 'kanban',
    label: 'Kanban',
    icon: '⊞',
  },
  {
    value: 'list',
    label: 'List',
    icon: '☰',
  },
  {
    value: 'timeline',
    label: 'Timeline',
    icon: '⊟',
  },
];

export default function ViewSwitcher({ currentView, onChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
      {views.map((v) => {
        const isActive = currentView === v.value;
        return (
          <button
            key={v.value}
            id={`view-tab-${v.value}`}
            onClick={() => onChange(v.value)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
              ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }
            `}
          >
            <span className="text-base">{v.icon}</span>
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
