import React from 'react';
import ProjectCard from '../../components/users/ProjectCard';
import { projects } from '../../data/projects';

export default function ProjectsPage() {
  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Projects</h1>
          <p className="mt-4 max-w-2xl text-yellow-100/85">
            Selected films, documentaries, music videos, and art projects crafted by our team.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} image={p.image} title={p.title} subtitle={p.subtitle} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Want to see more?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">Contact us for a full portfolio or to request project-specific reels.</p>
          <div className="mt-6">
            <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Email Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
