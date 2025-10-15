import React from 'react';

export default function ProjectCard({ image, title, subtitle, className = '' }) {
  return (
    <div className={`group ${className}`}>
      <div className="w-full aspect-[2/3] overflow-hidden bg-zinc-900">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-base md:text-lg font-extrabold uppercase tracking-wide text-yellow-50 leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-yellow-100/80 text-sm md:text-base mt-1 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}