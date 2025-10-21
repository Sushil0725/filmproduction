import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function NewsManager() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await authFetch('/api/public/json/news');
        if (mounted && r.ok) {
          const data = await r.json();
          setItems(Array.isArray(data) ? data : []);
        } else if (mounted) {
          setItems([]);
        }
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authFetch]);

  function addItem() {
    setItems(prev => ([...prev, { id: `news-${Date.now()}`, title: '', summary: '', date: new Date().toISOString().slice(0,10), image: '', content: '' }]));
  }
  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }
  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  async function saveAll() {
    setMsg('');
    const payload = items.map((n) => ({ id: n.id, title: n.title, summary: n.summary, date: n.date, image: n.image, content: n.content }));
    const r = await authFetch('/api/admin/json/news', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMsg(r.ok ? 'Saved' : 'Failed to save');
  }

  return (
    <div className="p-4 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">News Manager</div>
        <div className="flex gap-2">
          <button onClick={addItem} disabled={loading} className="rounded px-3 py-2 bg-white/10 hover:bg-white/15">Add News</button>
          <button onClick={saveAll} disabled={loading} className="rounded px-4 py-2 bg-yellow-500/90 text-black font-semibold hover:bg-yellow-400">Save All</button>
        </div>
      </div>
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}

      <div className="space-y-4">
        {items.map((n, idx) => (
          <div key={n.id || idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-yellow-300 font-semibold">{n.title || 'Untitled'}</div>
              <button onClick={()=>removeItem(idx)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Remove</button>
            </div>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-white/70 mb-1">ID</div>
                <input value={n.id} onChange={(e)=>updateItem(idx,{ id: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Date</div>
                <input type="date" value={n.date || ''} onChange={(e)=>updateItem(idx,{ date: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Title</div>
                <input value={n.title} onChange={(e)=>updateItem(idx,{ title: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Image URL</div>
                <input value={n.image || ''} onChange={(e)=>updateItem(idx,{ image: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" placeholder="/uploads/... or https://..." />
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-white/70 mb-1">Summary</div>
                <input value={n.summary || ''} onChange={(e)=>updateItem(idx,{ summary: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-white/70 mb-1">Content</div>
                <textarea rows={6} value={n.content || ''} onChange={(e)=>updateItem(idx,{ content: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-white/60">No news yet. Add one to get started.</div>
        )}
      </div>
    </div>
  );
}
