import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../ProjectCard';
import { projects as fallbackProjects } from '../../../data/projects';

export default function Projects() {
  const [items, setItems] = useState(() => fallbackProjects.slice(0, 6));
  useEffect(() => {
    fetch('/api/public/projects?limit=6')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length) setItems(data);
      })
      .catch(() => {});
  }, []);
  return (
    <section id="projects" className="py-16 relative z-10 bg-black">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Projects</h2>
            <p className="mt-2 text-yellow-100/80">Selected work across film, documentary, music, and art.</p>
          </div>
          <Link to="/projects" className="hidden sm:inline-flex items-center rounded-full bg-[#f5c518] px-5 py-2.5 text-black text-sm font-semibold hover:bg-[#ffd34d]">
            View All
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((p) => (
            <ProjectCard key={p.id || p.title} image={p.image_url || p.image} title={p.title} subtitle={p.subtitle} />
          ))}
        </div>

        <div className="mt-6 sm:hidden flex justify-center">
          <Link to="/projects" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}