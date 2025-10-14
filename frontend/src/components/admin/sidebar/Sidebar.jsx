import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarProvider';
import SidebarToggleButton from './SidebarToggleButton';
import { sidebarSections, organization } from './menuData';

function Icon({ name, className = 'h-5 w-5' }) {
  switch (name) {
    case 'app':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>
      );
      case 'board':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor"  d="M3 3h18v18H3V3zm2 2v14h14V5H5zm4 4h6v2H9V9zm0 4h6v2H9v-2z"/></svg>
      );
      case 'products':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor"  d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM12 4.26L18.74 8 12 11.74 5.26 8 12 4.26zM5 10.47l6 3.47v5.8l-6-3.43v-5.84zm8 9.27v-5.8l6-3.47v5.84l-6 3.43z"
    /></svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.41V7h-2v6l4.5 2.67 1-1.66L13 12.41z"/></svg>
      );
      case 'chart':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor"  d="M3 3v18h18v-2H5V3H3zm6 10h2v5H9v-5zm4-4h2v9h-2V9zm4-3h2v12h-2V6z"/></svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor"  d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.028 7.028 0 00-1.63-.94l-.36-2.54A.5.5 0 0014.31 2h-4.62a.5.5 0 00-.49.42l-.36 2.54c-.6.25-1.15.56-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.3 8.48a.5.5 0 00.12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32a.5.5 0 00.6.22l2.39-.96c.48.38 1.03.69 1.63.94l.36 2.54a.5.5 0 00.49.42h4.62a.5.5 0 00.49-.42l.36-2.54c.6-.25 1.15-.56 1.63-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z"
  /></svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M18 2H8a4 4 0 00-4 4v12a4 4 0 014 4h10a2 2 0 002-2V4a2 2 0 00-2-2zm0 18H8a2 2 0 010-4h10v4z"/></svg>
      );
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
      );
    case 'services':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M14.7 6.3a1 1 0 0 1 1 0l2 1.2a1 1 0 0 1 .3 1.3l-1.3 2a1 1 0 0 1-1.2.4 7 7 0 1 1-3.8-3.8 1 1 0 0 1 .4-1.2l2-1.3a1 1 0 0 1 1.3.4z"/></svg>
      );
    case 'projects':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2a10 10 0 00-3.16 19.47c.5.09.68-.22.68-.49v-1.7c-2.78.61-3.37-1.34-3.37-1.34-.46-1.17-1.12-1.48-1.12-1.48-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.54 2.36 1.09 2.94.83.09-.66.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.67-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.02A9.53 9.53 0 0112 7.08c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.4.2 2.44.1 2.7.64.69 1.03 1.58 1.03 2.67 0 3.85-2.34 4.7-4.57 4.95.36.32.68.95.68 1.92v2.84c0 .27.18.59.69.49A10 10 0 0012 2z"/></svg>
      );
    case 'admin':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    /></svg>
      );
      case 'news':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor"  d="M21 6h-2V3H5v3H3v14h18V6zM7 5h10v1H7V5zm12 13H5V8h14v10zm-2-8H7v2h10v-2zm0 3H7v2h10v-2z"/></svg>
      );
    case 'box':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM12 4.26L18.74 8 12 11.74 5.26 8 12 4.26zM5 10.47l6 3.47v5.8l-6-3.43v-5.84zm8 9.27v-5.8l6-3.47v5.84l-6 3.43z"/></svg>
      );
      case 'menu':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M3 12h18v2H3zm0-7h18v2H3zm0 14h18v2H3z"/></svg>
      );
      case 'home' : 
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      );
    default:
      return null;
  }
}

function CollapsedRail() {
  return (
    <div className="w-14 bg-black/60 border-r border-white/10 backdrop-blur h-screen fixed left-0 top-0 z-50 flex flex-col items-center py-3">
      <div className="h-10 w-10 rounded-md bg-white/10 flex items-center justify-center text-white">
        <Icon name="app" className="h-5 w-5" />
      </div>
      <SidebarToggleButton className="mt-3" />
      <div className="mt-4 flex-1 flex flex-col items-center space-y-2">
        {sidebarSections.flatMap(s => s.items).map(i => (
          <div key={i.id} className="group relative">
            <NavLink to={i.href} className={({ isActive }) => `h-10 w-10 flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 ${isActive ? 'bg-white/10 text-white' : ''}`}>
              <Icon name={i.icon} />
            </NavLink>
            <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition bg-white text-black text-xs px-2 py-1 rounded shadow">
              {i.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <div className="h-10 w-10 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function ExpandedPanel() {
  const { expanded } = useSidebar();
  return (
    <div className={`fixed left-14 top-0 h-screen z-40 transition-all duration-300 ${expanded ? 'w-64' : 'w-0'} overflow-hidden bg-neutral-900/80 border-r border-white/10 backdrop-blur`}> 
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{organization.name}</div>
            <div className="text-xs text-white/60 truncate">{organization.plan}</div>
          </div>
          <SidebarToggleButton />
        </div>
      </div>
      <nav className="px-2 pb-4 space-y-5 overflow-y-auto h-[calc(100vh-52px)]">
        {sidebarSections.map(section => (
          <div key={section.title}>
            <div className="px-2 text-xs uppercase tracking-wider text-white/40 mb-2">{section.title}</div>
            <ul className="space-y-1">
              {section.items.map(item => (
                <li key={item.id}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/85 hover:bg-white/10 hover:text-white ${isActive ? 'bg-white/10 text-white' : ''}`}
                  >
                    <Icon name={item.icon} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
      <CollapsedRail />
      <ExpandedPanel />
    </>
  );
}

