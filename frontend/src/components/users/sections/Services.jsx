import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../users/ServiceCard';
import nisi from '../../../assets/services/916.jpg';

export default function Services() {
  const items = [
    {
      title: 'Film Production',
      description: 'Feature films, shorts, and artistic projects with cinematic excellence.',
      image: nisi,
    },
    {
      title: 'Documentaries',
      description: 'Real stories crafted with depth, authenticity, and vision.',
      image: nisi,
    },
    {
      title: 'Music Videos',
      description: 'Bold, visually striking productions for artists and labels.',
      image: nisi,
    },
    {
      title: 'Post-Production',
      description: 'Editing, color grading, VFX, and sound to perfection.',
      image: nisi,
    },
    {
      title: 'Casting',
      description: 'Connecting your projects with the right talent across Canada.',
      image: nisi,
    },
    {
      title: 'Distribution',
      description: 'Delivering projects to audiences worldwide across platforms.',
      image: nisi,
    },
  ];
  const maskStyle = {
    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
  };

  // Drag-to-scroll support on desktop
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const dragState = useRef({ down: false, startX: 0, scrollLeft: 0, pid: 0 });

  function onPointerDown(e) {
    const el = wrapRef.current;
    if (!el) return;
    dragState.current = { down: true, startX: e.clientX, scrollLeft: el.scrollLeft, pid: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch {}
  }
  function onPointerMove(e) {
    const el = wrapRef.current;
    const st = dragState.current;
    if (!el || !st.down) return;
    const dx = e.clientX - st.startX;
    el.scrollLeft = st.scrollLeft - dx;
  }
  function onPointerUp(e) {
    const el = wrapRef.current;
    const st = dragState.current;
    st.down = false;
    try { el?.releasePointerCapture?.(st.pid); } catch {}
  }

  function getStep() {
    const el = wrapRef.current;
    const track = trackRef.current;
    if (!el || !track) return 0;
    const first = track.querySelector('.service-card');
    const gap = parseFloat(getComputedStyle(track).gap || '0');
    const w = first ? first.getBoundingClientRect().width : 0;
    return Math.max(0, Math.round(w + gap));
  }
  function scrollByCards(dir = 1) {
    const el = wrapRef.current; if (!el) return;
    const step = getStep();
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCards(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCards(-1); }
  }

  return (
    <section id="services" className="py-16 relative z-10 bg-black">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Our Services</h2>
        <p className="mt-2 text-yellow-100/80">Comprehensive production services from concept to distribution.</p>
        <div className="mt-8 group relative">
          {/* Scroll wrapper */}
          <div
            ref={wrapRef}
            className="overflow-x-auto overflow-y-visible no-scrollbar select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory"
            style={{ ...maskStyle, touchAction: 'pan-y', scrollBehavior: 'smooth' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onKeyDown={onKeyDown}
            tabIndex={0}
            aria-label="Our services carousel"
          >
            {/* Track */}
            <div
              ref={trackRef}
              className="flex gap-6 animate-marquee"
              style={{ width: 'max-content', animationDuration: '40s' }}
            >
              {[...items, ...items].map((it, idx) => (
                <div key={`${it.title}-${idx}`} aria-hidden={idx >= items.length} className="flex-shrink-0 snap-start">
                  <ServiceCard
                    image={it.image}
                    title={it.title}
                    description={it.description}
                    className="w-40 sm:w-48 md:w-56 lg:w-64"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-yellow-500/30 text-yellow-200 hover:bg-black/70"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-yellow-500/30 text-yellow-200 hover:bg-black/70"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        
          {/* View More CTA */}
          <div className="mt-6 flex justify-center">
            <Link to="/services" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">
              View More
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
