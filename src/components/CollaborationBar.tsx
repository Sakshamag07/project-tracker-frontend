import Avatar from './Avatar';
import type { CollaborationUser } from '../types';

interface CollaborationBarProps {
  activeUsers: CollaborationUser[];
  viewerCount: number;
}

export default function CollaborationBar({ activeUsers, viewerCount }: CollaborationBarProps) {
  if (viewerCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
      <div className="flex items-center -space-x-2">
        {activeUsers.map((cu) => (
          <div key={cu.user.id} className="collaboration-dot">
            <Avatar user={cu.user} size="sm" />
          </div>
        ))}
      </div>
      <span className="text-sm font-medium text-emerald-700">
        {viewerCount} {viewerCount === 1 ? 'person is' : 'people are'} viewing this board
      </span>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
    </div>
  );
}
