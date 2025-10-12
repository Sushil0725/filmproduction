import React from 'react';
import ServiceCard from '../../components/users/ServiceCard';
import { services } from '../../data/services';

export default function ServicesPage() {
  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Our Services</h1>
          <p className="mt-4 max-w-2xl text-yellow-100/85">
            Full‑stack film and media production. From development and casting to on‑set execution, post, and distribution.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.id} image={s.image} title={s.title} description={s.description} className="w-full" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Have a project in mind?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">Tell us about your service needs and we’ll craft a tailored production plan.</p>
          <div className="mt-6">
            <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Email Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
