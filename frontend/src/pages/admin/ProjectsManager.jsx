import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { projects as fallbackProjects } from '../../data/projects';

export default function ProjectsManager() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await authFetch('/api/public/json/projects');
        if (mounted && r.ok) {
          const data = await r.json();
          setItems(Array.isArray(data) ? data : (fallbackProjects || []));
        } else if (mounted) {
          setItems(fallbackProjects || []);
        }
      } catch {
        if (mounted) setItems(fallbackProjects || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authFetch]);

  function addItem() {
    setItems(prev => ([...prev, { id: `proj-${Date.now()}`, title: '', subtitle: '', image: '' }]));
  }
  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }
  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  async function saveAll() {
    setMsg('');
    const payload = items.map(p => ({ id: p.id, title: p.title, subtitle: p.subtitle, image: p.image }));
    const r = await authFetch('/api/admin/json/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMsg(r.ok ? 'Saved' : 'Failed to save');
  }

  return (
    <div className="p-4 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Projects Manager</div>
        <div className="flex gap-2">
          <button onClick={addItem} disabled={loading} className="rounded px-3 py-2 bg-white/10 hover:bg-white/15">Add Project</button>
          <button onClick={saveAll} disabled={loading} className="rounded px-4 py-2 bg-yellow-500/90 text-black font-semibold hover:bg-yellow-400">Save All</button>
        </div>
      </div>
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((p, idx) => (
          <div key={p.id || idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-yellow-300 font-semibold">{p.title || 'Untitled'}</div>
              <button onClick={()=>removeItem(idx)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Remove</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="text-sm text-white/70 mb-1">ID</div>
                <input value={p.id} onChange={(e)=>updateItem(idx, { id: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Title</div>
                <input value={p.title} onChange={(e)=>updateItem(idx, { title: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Subtitle</div>
                <input value={p.subtitle} onChange={(e)=>updateItem(idx, { subtitle: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div className="col-span-2">
                <div className="text-sm text-white/70 mb-1">Image URL</div>
                <input value={p.image || ''} onChange={(e)=>updateItem(idx, { image: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" placeholder="https://... or /uploads/..." />
              </div>
            </div>
            <div className="mt-3">
              <div className="aspect-[16/9] rounded-lg overflow-hidden border border-white/10 bg-black/40">
                {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.style.display='none'; }} />}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-white/60">No projects yet. Add one to get started.</div>
        )}
      </div>
    </div>
  );
}
