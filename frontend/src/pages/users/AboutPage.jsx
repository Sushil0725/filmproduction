import React from 'react';
import teamImg from '../../assets/team.png';

export default function AboutPage() {
  const values = [
    { title: 'Creativity', desc: 'Bold visual language and storytelling at every stage.' },
    { title: 'Integrity', desc: 'Transparent communication and dependable delivery.' },
    { title: 'Excellence', desc: 'High production value and best‑in‑class collaborators.' },
    { title: 'Innovation', desc: 'Modern workflows, new formats, and audience‑first design.' },
  ];

  const stats = [
    { k: '10+', v: 'Years Experience' },
    { k: '50+', v: 'Projects Delivered' },
    { k: '7', v: 'Provinces Covered' },
  ];

  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">About Us</h1>
            <p className="mt-4 max-w-2xl text-yellow-100/85">
              At MB Pictures Canada Inc., we turn stories into cinematic experiences. Based in London, Ontario, we operate
              nationwide across film, media, and post‑production—helping creators go from idea to audience.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#mission" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Our Mission</a>
              <a href="#team" className="inline-flex items-center rounded-full border border-yellow-500/50 px-6 py-3 text-yellow-100 hover:bg-yellow-500/10">Team</a>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-yellow-500/30 bg-zinc-950">
            <img src={teamImg} alt="MB Pictures Team" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section id="mission" className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Our Mission</h2>
            <p className="mt-4 text-yellow-100/85">
              To produce films, music videos, documentaries, and art projects that inspire audiences—while supporting creators with
              world‑class line production, post‑production, and distribution.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-yellow-500/20 bg-black/40 p-4">
                  <div className="text-yellow-300 font-semibold">{v.title}</div>
                  <div className="text-sm text-yellow-100/80 mt-1">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 self-start">
            {stats.map((s) => (
              <div key={s.v} className="rounded-2xl border border-yellow-500/20 bg-black/40 px-6 py-8 text-center">
                <div className="text-3xl font-extrabold text-yellow-300">{s.k}</div>
                <div className="mt-1 text-sm text-yellow-100/75">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-16 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">The Team</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl">
            A network of producers, line producers, cinematographers, editors, colorists, and sound designers working across Canada.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
                <div className="h-40 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 mb-4" />
                <div className="font-semibold text-yellow-200">Crew Member {i}</div>
                <div className="text-sm text-yellow-100/75">Role / Specialty</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Ready to collaborate?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">Tell us about your project and we’ll plan the next steps with you.</p>
          <div className="mt-6">
            <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Email Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
