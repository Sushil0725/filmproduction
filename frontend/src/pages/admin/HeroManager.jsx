import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function HeroManager() {
  const { authFetch } = useAuth();
  const [heroText, setHeroText] = useState('');
  const [site, setSite] = useState({ title: '', tagline: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r1 = await authFetch('/api/public/text/hero');
        if (mounted && r1.ok) setHeroText(await r1.text());
      } catch {}
      try {
        const r2 = await authFetch('/api/public/json/site');
        if (mounted && r2.ok) setSite(await r2.json());
      } catch {}
    })();
    return () => { mounted = false; };
  }, [authFetch]);

  async function saveHero(e) {
    e.preventDefault(); setSaving(true); setMsg('');
    const r = await authFetch('/api/admin/text/hero', { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: heroText });
    setSaving(false); setMsg(r.ok ? 'Hero text saved' : 'Failed to save hero text');
  }

  async function saveSite(e) {
    e.preventDefault(); setSaving(true); setMsg('');
    const r = await authFetch('/api/admin/json/site', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(site) });
    setSaving(false); setMsg(r.ok ? 'Site settings saved' : 'Failed to save site settings');
  }

  return (
    <div className="p-4 space-y-6 text-white">
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}

      <section className="grid md:grid-cols-2 gap-6">
        <form onSubmit={saveHero} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-lg font-semibold">Hero Text</div>
          <textarea rows={8} value={heroText} onChange={(e)=>setHeroText(e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded p-3" placeholder="Nationwide Movie Production • Line Production • Post Production • Distribution" />
          <button disabled={saving} className="rounded px-4 py-2 bg-white/10 hover:bg-white/15">Save</button>
        </form>

        <form onSubmit={saveSite} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-lg font-semibold">Hero Headline & Tagline</div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Title</label>
            <input value={site.title || ''} onChange={(e)=>setSite(s=>({ ...s, title: e.target.value }))} className="w-full bg-neutral-800/70 border border-white/10 rounded p-3" placeholder="MB Pictures Canada Inc." />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Tagline</label>
            <input value={site.tagline || ''} onChange={(e)=>setSite(s=>({ ...s, tagline: e.target.value }))} className="w-full bg-neutral-800/70 border border-white/10 rounded p-3" placeholder="Canada's Complete Film & Media Production House" />
          </div>
          <button disabled={saving} className="rounded px-4 py-2 bg-white/10 hover:bg-white/15">Save</button>
        </form>
      </section>
    </div>
  );
}
