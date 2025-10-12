import React from 'react';

export default function Button({ variant = 'solid', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded text-sm transition-colors';
  const styles = {
    solid: 'bg-black text-white hover:bg-gray-800',
    outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'text-gray-800 hover:bg-gray-100',
  };
  const cls = `${base} ${styles[variant] || styles.solid} ${className}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
