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
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.41V7h-2v6l4.5 2.67 1-1.66L13 12.41z"/></svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 4a7.5 7.5 0 00-.14-1.32l2.11-1.65-2-3.46-2.49 1a7.55 7.55 0 00-2.28-1.33l-.38-2.65h-4l-.38 2.65a7.55 7.55 0 00-2.28 1.33l-2.49-1-2 3.46 2.11 1.65A7.5 7.5 0 004.6 12c0 .45.05.89.14 1.32L2.63 15l2 3.46 2.49-1c.67.55 1.44.99 2.28 1.33l.38 2.65h4l.38-2.65c.84-.34 1.61-.78 2.28-1.33l2.49 1 2-3.46-2.11-1.65c.09-.43.14-.87.14-1.32z"/></svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M18 2H8a4 4 0 00-4 4v12a4 4 0 014 4h10a2 2 0 002-2V4a2 2 0 00-2-2zm0 18H8a2 2 0 010-4h10v4z"/></svg>
      );
    case 'box':
      return (
        <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM12 4.26L18.74 8 12 11.74 5.26 8 12 4.26zM5 10.47l6 3.47v5.8l-6-3.43v-5.84zm8 9.27v-5.8l6-3.47v5.84l-6 3.43z"/></svg>
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

