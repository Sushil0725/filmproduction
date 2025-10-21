import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { serviceCategories as fallbackCategories } from '../../data/serviceCategories';

export default function ServicesManager() {
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await authFetch('/api/public/json/service-categories');
        if (mounted && r.ok) {
          const data = await r.json();
          setCategories(Array.isArray(data) ? data : fallbackCategories);
        } else if (mounted) {
          setCategories(fallbackCategories);
        }
      } catch {
        if (mounted) setCategories(fallbackCategories);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authFetch]);

  function addCategory() {
    setCategories((prev) => ([...prev, { id: `cat-${Date.now()}`, name: '', summary: '', items: [] }]));
  }
  function removeCategory(idx) {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateCategory(idx, patch) {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function addItem(cIdx) {
    setCategories((prev) => prev.map((c, i) => i === cIdx ? { ...c, items: [...(c.items||[]), { title: '', points: [] }] } : c));
  }
  function removeItem(cIdx, iIdx) {
    setCategories((prev) => prev.map((c, i) => i === cIdx ? { ...c, items: c.items.filter((_, j) => j !== iIdx) } : c));
  }
  function updateItem(cIdx, iIdx, patch) {
    setCategories((prev) => prev.map((c, i) => i === cIdx ? { ...c, items: c.items.map((it, j) => j === iIdx ? { ...it, ...patch } : it) } : c));
  }

  async function saveAll() {
    setMsg('');
    const payload = categories.map((c) => ({
      id: c.id || c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: c.name || '',
      summary: c.summary || '',
      items: (c.items || []).map((it) => ({
        title: it.title || '',
        points: Array.isArray(it.points)
          ? it.points
          : String(it.points || '')
              .split(/\r?\n|,\s*/)
              .map((s) => s.trim())
              .filter(Boolean),
      })),
    }));
    const r = await authFetch('/api/admin/json/service-categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMsg(r.ok ? 'Saved' : 'Failed to save');
  }

  const disabled = loading;

  return (
    <div className="p-4 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Services Manager</div>
        <div className="flex gap-2">
          <button onClick={addCategory} disabled={disabled} className="rounded px-3 py-2 bg-white/10 hover:bg-white/15">Add Category</button>
          <button onClick={saveAll} disabled={disabled} className="rounded px-4 py-2 bg-yellow-500/90 text-black font-semibold hover:bg-yellow-400">Save All</button>
        </div>
      </div>
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}

      <div className="space-y-6">
        {categories.map((c, cIdx) => (
          <div key={cIdx} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-yellow-300">Category</div>
              <button onClick={() => removeCategory(cIdx)} className="text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/15">Remove</button>
            </div>
            <div className="mt-3 grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-white/70 mb-1">ID</div>
                <input value={c.id} onChange={(e)=>updateCategory(cIdx,{ id: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div className="md:col-span-1">
                <div className="text-sm text-white/70 mb-1">Name</div>
                <input value={c.name} onChange={(e)=>updateCategory(cIdx,{ name: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div className="md:col-span-1">
                <div className="text-sm text-white/70 mb-1">Summary</div>
                <input value={c.summary} onChange={(e)=>updateCategory(cIdx,{ summary: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-white/80">Items</div>
                <button onClick={()=>addItem(cIdx)} className="text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/15">Add Item</button>
              </div>
              <div className="mt-3 grid md:grid-cols-2 gap-4">
                {(c.items || []).map((it, iIdx) => (
                  <div key={iIdx} className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/70">Item {iIdx+1}</div>
                      <button onClick={()=>removeItem(cIdx, iIdx)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Remove</button>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-white/60 mb-1">Title</div>
                      <input value={it.title} onChange={(e)=>updateItem(cIdx,iIdx,{ title: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-white/60 mb-1">Points (one per line)</div>
                      <textarea rows={4} value={Array.isArray(it.points) ? it.points.join('\n') : (it.points || '')} onChange={(e)=>updateItem(cIdx,iIdx,{ points: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <div className="text-white/60">No categories. Add one to get started.</div>
        )}
      </div>
    </div>
  );
}
