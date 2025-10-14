import React from 'react';

export default function ProjectCard({ image, title, subtitle, className = '' }) {
  return (
    <div className={`group relative aspect-[16/9] rounded-2xl overflow-hidden border border-yellow-500/20 bg-zinc-900 shadow-md cursor-pointer ${className}`}>
      {/* Background image */}
      {image ? (
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Video preview overlay with play icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-16 h-16 rounded-full bg-[#f5c518]/95 backdrop-blur-sm flex items-center justify-center shadow-[0_0_40px_rgba(245,197,24,0.6)] group-hover:scale-110 transition-transform duration-300">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black translate-x-0.5">
            <path d="M8 6v12l10-6-10-6z" />
          </svg>
        </div>
      </div>

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <h3 className="text-lg font-semibold text-yellow-300 drop-shadow-lg mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-yellow-50/90 drop-shadow">{subtitle}</p>}
      </div>

      {/* Subtle inner glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
           style={{
             boxShadow: 'inset 0 0 30px rgba(245, 197, 24, 0.15)'
           }} 
      />
    </div>
  );
}
