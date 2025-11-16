import React from 'react';
import ServiceCard from '../../components/users/ServiceCard';
import { serviceCategories } from '../../data/serviceCategories';
import preProdImg from '../../assets/services/pre_prod.jpg';
import prodImg from '../../assets/services/prod.jpg';
import postProdImg from '../../assets/services/post_prod.jpg';
import distMarketImg from '../../assets/services/dist_market.jpg';
import stdEquImg from '../../assets/services/std_equ.jpg';
import talentImg from '../../assets/services/talent.jpg';
import consltImg from '../../assets/services/conslt.jpg';


export default function ServicesPage() {
  const categories = serviceCategories;

  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Production Services</h1>
          <p className="mt-4 max-w-3xl text-yellow-100/85">
            End‑to‑end film and media production: pre‑production, production, post, distribution & marketing, studio & equipment, talent & creative, and consulting.
          </p>
          <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="whitespace-nowrap rounded-full border border-yellow-500/30 bg-black/40 px-3 py-1.5 text-sm text-yellow-100/90 hover:text-yellow-300 hover:bg-yellow-500/10"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {(() => {
              const images = {
                'pre-production': preProdImg,
                production: prodImg,
                'post-production': postProdImg,
                'distribution-marketing': distMarketImg,
                'studio-equipment': stdEquImg,
                'talent-creative': talentImg,
                'consulting-support': consltImg,
              };

              return categories.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="block focus:outline-none focus:ring-2 ring-[#f5c518]/60 rounded-2xl"
                >
                  <ServiceCard
                    title={c.name}
                    description={c.summary}
                    image={images[c.id]}
                    className="w-full"
                  />
                </a>
              ));
            })()}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden lg:block sticky top-24 h-max">
            <nav className="space-y-1">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="block px-3 py-2 rounded-lg text-yellow-100/80 hover:text-yellow-300 hover:bg-yellow-500/10"
                >
                  {c.name}
                </a>
              ))}
            </nav>
          </aside>

          <div>
            {categories.map((c) => (
              <section key={c.id} id={c.id} className="scroll-mt-28 border-t border-yellow-500/10 pt-10 mt-10">
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">{c.name}</h2>
                <p className="mt-2 text-yellow-100/85 max-w-3xl">{c.summary}</p>

                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {c.items.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-yellow-500/20 bg-zinc-900/60 p-6">
                      <div className="text-lg font-semibold text-yellow-200">{item.title}</div>
                      <ul className="mt-3 space-y-2 text-yellow-100/85 list-disc pl-5">
                        {item.points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <a
                    href={`mailto:info@mbpicturescanada.com?subject=${encodeURIComponent('Inquiry: ' + c.name)}`}
                    className="inline-flex items-center rounded-full bg-[#f5c518] px-5 py-2.5 text-black font-semibold hover:bg-[#ffd34d]"
                  >
                    Request {c.name}
                  </a>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Have a project in mind?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">Share your vision. We’ll build a tailored production plan, budget and schedule.</p>
          <div className="mt-6">
            <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Email Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
