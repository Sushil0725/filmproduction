import React from 'react';

export default function ProjectCard({ image, title, subtitle, className = '' }) {
  return (
    <div className={`group relative aspect-[16/9] rounded-2xl overflow-hidden border border-yellow-500/20 bg-zinc-900 shadow-md ${className}`}>
      {image ? (
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-lg font-semibold text-yellow-300 drop-shadow">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-yellow-50/90">{subtitle}</p>}
      </div>
    </div>
  );
}