import type { User } from '../types';
import React from 'react';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = React.memo(function Avatar({ user, size = 'md', showTooltip = true }: AvatarProps) {
  return (
    <div className="relative group inline-flex" title={showTooltip ? user.name : undefined}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ring-2 ring-white`}
        style={{ backgroundColor: user.color }}
      >
        {getInitials(user.name)}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          {user.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
});

export default Avatar;
