import { useMemo, lazy, Suspense } from 'react';
import { TaskProvider, useTaskContext } from './TaskContext';
import ViewSwitcher from './components/ViewSwitcher';
import FilterBar from './components/FilterBar';
import CollaborationBar from './components/CollaborationBar';
import KanbanBoard from './components/KanbanBoard';
import { useCollaboration } from './hooks/useCollaboration';

// Code-split heavy views to reduce initial JS bundle
const ListView = lazy(() => import('./components/ListView'));
const TimelineView = lazy(() => import('./components/TimelineView'));

function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading view…</span>
      </div>
    </div>
  );
}

function AppContent() {
  const { state, dispatch, filteredTasks } = useTaskContext();

  const taskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks]);
  const { activeUsers, getTaskCollaborators, viewerCount } = useCollaboration(taskIds);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Logo / Title */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">
                    Project Tracker
                  </h1>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {filteredTasks.length} tasks
                  </p>
                </div>
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200" />

              <ViewSwitcher
                currentView={state.view}
                onChange={(view) => dispatch({ type: 'SET_VIEW', view })}
              />
            </div>

            <CollaborationBar activeUsers={activeUsers} viewerCount={viewerCount} />
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="max-w-[1600px] mx-auto px-6 py-3 border-b border-slate-100 bg-white/40">
        <FilterBar />
      </div>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-5">
        {state.view === 'kanban' && (
          <KanbanBoard getTaskCollaborators={getTaskCollaborators} />
        )}
        {state.view === 'list' && (
          <Suspense fallback={<ViewFallback />}>
            <ListView getTaskCollaborators={getTaskCollaborators} />
          </Suspense>
        )}
        {state.view === 'timeline' && (
          <Suspense fallback={<ViewFallback />}>
            <TimelineView />
          </Suspense>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
