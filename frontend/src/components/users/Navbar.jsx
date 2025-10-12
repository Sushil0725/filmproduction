import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ brand = 'FilmPro', links = [{ to: '/', label: 'Home' }], right = null }) {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-gray-100 text-sm ${isActive ? 'text-black font-medium' : 'text-gray-600'}`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">{brand}</div>
            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">{right}</div>

          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded border"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-3 py-2 flex flex-col">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`
              } onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <div className="px-3 py-2 border-t mt-2">{right}</div>
          </nav>
        </div>
      )}
    </header>
  );
}
