import React from 'react';
import herobg from '../../../assets/herobg.mp4';

export default function Hero({ title, tagline, heroText }) {
  const headline = title || 'MB Pictures Canada Inc.';
  const sub = tagline || 'Canada’s Complete Film & Media Production House';
  const desc = heroText || 'Nationwide Movie Production • Line Production • Post Production • Distribution';

  return (
    <section id="home" className="relative h-screen">
      {/* Fixed pinned hero underneath other content */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Background video from assets */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={herobg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* Cinematic light beams background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-yellow-500/10 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full mx-auto max-w-7xl px-4">
          <div className="grid h-full md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-8 pt-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-[#f5c518] drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                {sub}
              </h1>
              <p className="mt-4 text-base md:text-lg text-yellow-50/90 max-w-3xl">
                {desc}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#get-started" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold shadow-[0_0_30px_rgba(245,197,24,0.25)] hover:bg-[#ffd34d] transition">
                  Start Your Project
                </a>
                <a href="#services" className="inline-flex items-center rounded-full bg-transparent px-6 py-3 text-[#f5c518] hover:text-black border-[#f5c518] border-2 font-semibold shadow-[0_0_30px_rgba(245,197,24,0.2)] hover:bg-[#ffd34d] transition">
                  View Our Work
                </a>
              </div>
            </div>
            <div className="hidden md:flex md:col-span-4 justify-center">
              <div className="relative w-30 h-30 rounded-full bg-[#c6a300] shadow-[0_0_60px_rgba(245,197,24,0.25)] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-20 h-20 fill-black hover:scale-130 transition-all duration-300 translate-x-1" aria-hidden="true">
                  <path d="M8 6v12l10-6-10-6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
