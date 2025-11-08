import React, { useMemo, useState } from 'react';
import { serviceCategories } from '../../data/serviceCategories';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');

  const serviceOptions = useMemo(() => serviceCategories.map((c) => c.name), []);

  const onSubmit = (e) => {
    e.preventDefault();
    const to = 'info@mbpicturescanada.com';
    const subject = `Project Inquiry${service ? `: ${service}` : ''} – ${name || 'New Client'}`;
    const lines = [
      `Name: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `Service: ${service || '-'}`,
      `Budget: ${budget || '-'}`,
      '',
      'Message:',
      message || '-',
      '',
      '— Sent from MB Pictures website'
    ];
    const body = encodeURIComponent(lines.join('\n'));
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Get Started</h1>
          <p className="mt-4 max-w-3xl text-yellow-100/85">
            Tell us about your project. We’ll get back with a tailored plan, timeline and estimate.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <form onSubmit={onSubmit} className="rounded-2xl border border-yellow-500/20 bg-zinc-900/60 p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-yellow-200 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full rounded-xl bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-yellow-50 placeholder-yellow-100/50 focus:outline-none focus:ring-2 ring-[#f5c518]/60"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-yellow-50 placeholder-yellow-100/50 focus:outline-none focus:ring-2 ring-[#f5c518]/60"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-yellow-200 mb-1">Service</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-yellow-50 focus:outline-none focus:ring-2 ring-[#f5c518]/60"
                  >
                    <option value="">Select a service</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-yellow-200 mb-1">Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-yellow-50 focus:outline-none focus:ring-2 ring-[#f5c518]/60"
                  >
                    <option value="">Select a range</option>
                    <option value="<$5k">Less than $5k</option>
                    <option value="$5k–$15k">$5k–$15k</option>
                    <option value="$15k–$50k">$15k–$50k</option>
                    <option value=">$50k">Over $50k</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-yellow-200 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-yellow-50 placeholder-yellow-100/50 focus:outline-none focus:ring-2 ring-[#f5c518]/60"
                  placeholder="Tell us about your project goals, timeline, references, locations, etc."
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button type="submit" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">
                  Send Inquiry
                </button>
                <a
                  href="mailto:info@mbpicturescanada.com"
                  className="text-sm text-yellow-100/80 hover:text-yellow-300"
                >
                  Or email us directly
                </a>
              </div>
            </form>

            <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900/40 p-6">
              <h3 className="text-xl font-semibold text-yellow-300">Contact</h3>
              <div className="mt-4 space-y-3 text-yellow-100/85">
                <div>
                  <div className="text-yellow-200">Email</div>
                  <a href="mailto:info@mbpicturescanada.com" className="hover:text-yellow-300">info@mbpicturescanada.com</a>
                </div>
                <div className="pt-2 border-t border-yellow-500/10">
                  <p>
                    We typically respond within 1–2 business days.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-yellow-200">Why work with us</h4>
                <ul className="mt-3 space-y-2 text-yellow-100/85 list-disc pl-5">
                  <li>Full-cycle production from idea to delivery</li>
                  <li>Experienced crew and network</li>
                  <li>Transparent budgets and timelines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
