import React from 'react';

export default function CardGrid({ children, className = '' }) {
  // Default responsive grid: 1 / 2 / 3 / 4 cols
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
}
