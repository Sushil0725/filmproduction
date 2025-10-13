import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SidebarContext = createContext({ expanded: true, setExpanded: () => {}, toggle: () => {} });

export function SidebarProvider({ children, defaultExpanded }) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const v = localStorage.getItem('admin.sidebar.expanded');
      if (v === null) return defaultExpanded ?? true;
      return v === '1';
    } catch {
      return defaultExpanded ?? true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin.sidebar.expanded', expanded ? '1' : '0');
    } catch {}
  }, [expanded]);

  const value = useMemo(() => ({ expanded, setExpanded, toggle: () => setExpanded(v => !v) }), [expanded]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useContext(SidebarContext);
}

