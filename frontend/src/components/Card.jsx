import React from 'react';
import { Link } from 'react-router-dom';

export default function Card({
  image,
  title,
  subtitle,
  description,
  children,
  href,
  to,
  footer,
  className = '',
  variant = 'light', // 'light' | 'dark'
}) {
  const Wrapper = to ? Link : href ? 'a' : 'div';
  const wrapperProps = to
    ? { to }
    : href
    ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: href.startsWith('http') ? 'noreferrer' : undefined }
    : {};

  const baseCls =
    variant === 'dark'
      ? 'rounded-lg border border-yellow-500/20 bg-zinc-900 text-yellow-100/90 shadow-sm overflow-hidden hover:shadow-yellow-500/10 hover:shadow-lg transition-shadow'
      : 'rounded-lg border bg-white shadow-sm overflow-hidden';

  return (
    <div className={`${baseCls} ${className}`}>
      {image && (
        <div className={`aspect-[16/9] overflow-hidden ${variant === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
          <img src={image} alt={title || ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-2">
        {title && (
          <Wrapper className="block" {...wrapperProps}>
            <h3 className={`text-base font-semibold leading-tight hover:underline ${variant === 'dark' ? 'text-yellow-100' : ''}`}>{title}</h3>
          </Wrapper>
        )}
        {subtitle && <p className={`${variant === 'dark' ? 'text-yellow-200/70' : 'text-gray-500'} text-xs`}>{subtitle}</p>}
        {description && <p className={`${variant === 'dark' ? 'text-yellow-100/80' : 'text-gray-700'} text-sm`}>{description}</p>}
        {children}
      </div>
      {footer && (
        <div className={`px-4 py-3 text-sm ${variant === 'dark' ? 'border-t border-yellow-500/20 bg-zinc-950/60' : 'border-t bg-gray-50'}`}>{footer}</div>
      )}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}
