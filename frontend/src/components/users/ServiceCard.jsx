import React from 'react';

export default function ServiceCard({ image, title, description, className = '' }) {
  return (
    <div className={`service-card group relative aspect-[4/5] rounded-2xl overflow-hidden border border-yellow-500/20 bg-zinc-900 shadow-md transition-shadow hover:shadow-yellow-500/10 ${className}`}>
      {image ? (
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}

      {/* Hover overlay: always visible on mobile, on hover for md+ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute inset-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-yellow-300 drop-shadow">{title}</h3>
          <p className="mt-1 text-sm text-yellow-50/90 max-w-[95%]">{description}</p>
        </div>
      </div>
    </div>
  );
}
