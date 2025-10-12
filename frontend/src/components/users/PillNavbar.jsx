import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PillNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const baseCls =
    'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300';
  const pillCls = `flex items-center gap-1 rounded-full border px-2 py-1 backdrop-blur ${
    scrolled ? 'bg-black/70 border-yellow-500/40 shadow-lg shadow-yellow-500/10' : 'bg-black/50 border-yellow-500/30'
  }`;
  const linkCls =
    'text-sm text-yellow-100/90 hover:text-yellow-300 px-3 py-1.5 rounded-full hover:bg-yellow-500/10';
  const ctaCls =
    'ml-1 text-sm font-medium bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1.5 rounded-full';

  return (
    <div className={baseCls}>
      <nav className={pillCls} aria-label="Primary">
        {isHome ? (
          <>
            <a className={linkCls} href="#home" onClick={() => setOpen(false)}>Home</a>
            <a className={linkCls} href="#line-production" onClick={() => setOpen(false)}>Line Production</a>
            <a className={linkCls} href="#services" onClick={() => setOpen(false)}>Services</a>
            <a className={linkCls} href="#projects" onClick={() => setOpen(false)}>Projects</a>
            <a className={ctaCls} href="#get-started" onClick={() => setOpen(false)}>Get Started</a>
          </>
        ) : (
          <>
            <Link className={linkCls} to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link className={linkCls} to="/line-production" onClick={() => setOpen(false)}>Line Production</Link>
            <Link className={linkCls} to="/services" onClick={() => setOpen(false)}>Services</Link>
            <Link className={linkCls} to="/projects" onClick={() => setOpen(false)}>Projects</Link>
            <Link className={ctaCls} to="/#get-started" onClick={() => setOpen(false)}>Get Started</Link>
          </>
        )}
        <button
          className="md:hidden ml-1 inline-flex items-center justify-center w-8 h-8 rounded-full border border-yellow-500/40 text-yellow-300"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3.75 6.75a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 10.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
      {open && (
        <div className="mt-2 mx-auto w-[92vw] max-w-sm rounded-2xl border border-yellow-500/40 bg-black/85 backdrop-blur p-2">
          <div className="flex flex-col">
            {isHome ? (
              <>
                <a className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" href="#home" onClick={() => setOpen(false)}>Home</a>
                <a className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" href="#line-production" onClick={() => setOpen(false)}>Line Production</a>
                <a className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" href="#services" onClick={() => setOpen(false)}>Services</a>
                <a className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" href="#projects" onClick={() => setOpen(false)}>Projects</a>
                <a className="mt-1 px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-medium" href="#get-started" onClick={() => setOpen(false)}>Get Started</a>
              </>
            ) : (
              <>
                <Link className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" to="/" onClick={() => setOpen(false)}>Home</Link>
                <Link className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" to="/line-production" onClick={() => setOpen(false)}>Line Production</Link>
                <Link className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" to="/services" onClick={() => setOpen(false)}>Services</Link>
                <Link className="px-3 py-2 rounded-xl text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10" to="/projects" onClick={() => setOpen(false)}>Projects</Link>
                <Link className="mt-1 px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-medium" to="/#get-started" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
