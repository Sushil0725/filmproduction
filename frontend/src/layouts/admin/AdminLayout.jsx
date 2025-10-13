import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin/sidebar/Sidebar';
import { SidebarProvider, useSidebar } from '../../components/admin/sidebar/SidebarProvider';

function Header() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\/+|\/+$/g, '').split('/').slice(1);
  return (
    <div className="px-4 pt-4">
      <div className="rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur px-4 py-3 text-white">
        <div className="text-sm flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/10">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>
          </span>
          <div className="text-white/70">{['Admin', ...parts].filter(Boolean).join(' > ') || 'Admin'}</div>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const { expanded } = useSidebar();
  return (
    <div
      className="transition-[margin] duration-300"
      style={{ marginLeft: expanded ? 'calc(3.5rem + 16rem)' : '3.5rem' }}
    >
      <Header />
      <main className="p-4">
        <div className="rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur p-4 text-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SidebarProvider>
        <Sidebar />
        <Content />
      </SidebarProvider>
    </div>
  );
}
