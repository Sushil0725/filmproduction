import React from 'react';
import { Link } from 'react-router-dom';

export default function LineProduction() {
  const bullets = [
    'Location Scouting & Permits – Urban settings, rural landscapes, studios, and more.',
    'Casting & Talent Management – Actors, extras, and performers for every type of project.',
    'Crew & Equipment – Skilled professionals and high-quality gear anywhere in Canada.',
    'Logistics & Scheduling – Travel, accommodation, catering, and daily management.',
    'Budget Management – Transparent planning to maximize production value.',
    'On-Set Support – Full supervision to ensure smooth execution.',
  ];

  return (
    <section id="line-production" className="py-16 relative z-10 bg-black">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Nationwide Line Production Services</h2>
            <p className="mt-3 text-yellow-100/80">
              We provide professional line production services across Canada. With a strong network of talent, crew, and industry
              connections, we ensure every project is handled with efficiency and creativity.
            </p>
            <ul className="mt-5 space-y-2 text-yellow-100/85 list-disc list-inside">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="mt-6 text-yellow-200/80 text-sm">
              Why choose MB Pictures Canada?
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nationwide reach with local expertise.</li>
                <li>Experienced in managing small to large productions.</li>
                <li>A one-stop solution: from planning to delivery.</li>
              </ul>
            </div>
            <div className="mt-8">
              <Link to="/line-production" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">View More</Link>
            </div>
          </div>
          <div>
            {/* Visual placeholder for glowing map of Canada */}
            <div className="relative aspect-[4/3] rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(253,224,71,0.15),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(253,224,71,0.12),transparent_40%)]" />
              <div className="absolute inset-0 flex items-center justify-center text-yellow-300/80">
                <span className="text-sm">Canada Map Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
