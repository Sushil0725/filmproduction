import React from 'react';

export default function Section({ title, subtitle, children, className = '', containerClass = 'max-w-7xl' }) {
  return (
    <section className={`py-10 ${className}`}>
      <div className={`mx-auto px-4 ${containerClass}`}>
        {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
        {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
