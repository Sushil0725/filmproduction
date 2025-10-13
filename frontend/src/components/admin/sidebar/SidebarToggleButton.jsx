import React from 'react';
import { useSidebar } from './SidebarProvider';

export default function SidebarToggleButton({ className = '' }) {
  const { expanded, toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      className={`inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white h-9 w-9 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        {expanded ? (
          <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        ) : (
          <path fill="currentColor" d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
        )}
      </svg>
    </button>
  );
}

