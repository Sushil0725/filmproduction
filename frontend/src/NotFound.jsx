import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you are looking for does not exist.</p>
      <Link className="px-4 py-2 border rounded" to="/">Go Home</Link>
    </div>
  );
}
