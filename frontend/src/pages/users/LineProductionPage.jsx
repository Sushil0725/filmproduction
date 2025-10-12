import React from 'react';

export default function LineProductionPage() {
  const bullets = [
    'Location Scouting & Permits – Urban settings, rural landscapes, studios, and more.',
    'Casting & Talent Management – Actors, extras, and performers for every type of project.',
    'Crew & Equipment – Skilled professionals and high-quality gear anywhere in Canada.',
    'Logistics & Scheduling – Travel, accommodation, catering, and daily management.',
    'Budget Management – Transparent planning to maximize production value.',
    'On-Set Support – Full supervision to ensure smooth execution.',
  ];

  const steps = [
    { title: 'Discovery', desc: 'Briefing, requirements, and production goals.' },
    { title: 'Planning', desc: 'Locations, permits, schedule, crew, and budget.' },
    { title: 'Pre‑Production', desc: 'Casting, tech scouts, resources, and logistics.' },
    { title: 'Production', desc: 'On‑set execution with full supervision.' },
    { title: 'Wrap & Delivery', desc: 'Handover, reporting, and post‑production coordination.' },
  ];

  const locations = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Winnipeg', 'Halifax'];

  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Line Production (Canada‑wide)</h1>
          <p className="mt-4 max-w-2xl text-yellow-100/85">
            We provide professional line production across Canada—covering scouting, casting, crew, logistics, budgeting, and
            on‑set support. Scale up with a reliable partner that delivers.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#contact" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Start Your Project</a>
            <a href="#capabilities" className="inline-flex items-center rounded-full border border-yellow-500/50 px-6 py-3 text-yellow-100 hover:bg-yellow-500/10">Our Capabilities</a>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Comprehensive Line Production</h2>
            <ul className="mt-6 space-y-2 text-yellow-100/85 list-disc list-inside">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="mt-6 text-sm text-yellow-200/80">
              Why choose MB Pictures Canada?
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nationwide reach with local expertise.</li>
                <li>Experienced in managing small to large productions.</li>
                <li>A one‑stop solution: from planning to delivery.</li>
              </ul>
            </div>
          </div>
          <div>
            <div className="relative aspect-[4/3] rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(253,224,71,0.15),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(253,224,71,0.12),transparent_40%)]" />
              <div className="absolute inset-0 flex items-center justify-center text-yellow-300/80">
                <span className="text-sm">Canada Coverage Visual</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-yellow-200/80">
              {locations.map((l) => (
                <span key={l} className="px-3 py-1 rounded-full border border-yellow-500/30 bg-black/40">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Our Process</h2>
          <ol className="mt-8 grid md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="relative p-4 rounded-xl border border-yellow-500/20 bg-black/40">
                <div className="text-yellow-300 font-bold">{String(i + 1).padStart(2, '0')}</div>
                <div className="mt-2 font-semibold text-yellow-100">{s.title}</div>
                <div className="mt-1 text-sm text-yellow-100/80">{s.desc}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Ready to Plan Your Shoot?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">Tell us about your production and we’ll respond with a scoped, actionable plan and timeline.</p>
          <div className="mt-6">
            <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Email Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
