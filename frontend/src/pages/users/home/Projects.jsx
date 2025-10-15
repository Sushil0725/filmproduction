import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../../data/projects';

export default function Projects() {
  const featured = projects.slice(0, 4);

  return (
    <section id="projects" className="py-16 relative z-10 bg-black">
      <div className="px-6 md:px-20">
        {/* Header Section */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-4xl md:text-4xl font-bold text-yellow-300">| Projects</h2>
            <p className="mt-2 text-yellow-100/80">
              Selected works across film, documentary, music, and art.
            </p>
          </div>
          <Link
            to="/projects"
            className="hidden sm:inline-flex items-center rounded-full bg-[#f5c518] px-5 py-2.5 text-black text-sm font-semibold hover:bg-[#ffd34d] transition-all duration-300"
          >
            View All
          </Link>
        </div>

      
        <div
          className="
            mt-10 
            grid 
            gap-6
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            auto-rows-[minmax(200px,auto)]
          "
        >
          {featured.map((project, index) => (
            <div
              key={index}
              className="relative group overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[2/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <p className="text-yellow-300 font-semibold text-lg">{project.title}</p>
                </div>
              </div>

              {/* Text */}
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-yellow-300">{project.title}</h3>
                <p className="text-yellow-50/80 mt-1">{project.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile "View All" Button */}
        <div className="mt-10 sm:hidden flex justify-center">
          <Link
            to="/projects"
            className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d] transition-all duration-300"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
