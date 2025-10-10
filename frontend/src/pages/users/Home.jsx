import React, { useEffect, useState } from 'react';

export default function Home() {
  const [site, setSite] = useState(null);
  const [hero, setHero] = useState('');

  useEffect(() => {
    fetch('/api/public/json/site').then(async (r) => {
      if (r.ok) setSite(await r.json());
    }).catch(() => {});
    fetch('/api/public/text/hero').then(async (r) => {
      if (r.ok) setHero(await r.text());
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{site?.title || 'Film Production House'}</h1>
        <p className="text-gray-600">{site?.tagline || 'Crafting stories on screen'}</p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hero Text</h2>
        <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">{hero || 'Set hero text from admin panel.'}</p>
      </section>
    </div>
  );
}
