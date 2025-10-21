import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { galleryItems as fallbackGallery, mediaTypes as fallbackTypes } from '../../data/gallery';

export default function GalleryManager() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await authFetch('/api/public/json/gallery');
        if (mounted && r.ok) {
          const data = await r.json();
          setItems(Array.isArray(data) ? data : (fallbackGallery || []));
        } else if (mounted) {
          setItems(fallbackGallery || []);
        }
      } catch {
        if (mounted) setItems(fallbackGallery || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authFetch]);

  const types = fallbackTypes || ['All', 'Images', 'Videos', 'BTS', 'Events'];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((it) => {
      const byType = typeFilter === 'All' || (it.type === typeFilter || it.category === typeFilter);
      const byQuery = !q || (it.title || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q);
      return byType && byQuery;
    });
  }, [items, typeFilter, query]);

  function addItem() {
    setItems((prev) => ([...prev, { id: `gallery-${Date.now()}`, type: 'Images', mediaType: 'image', title: '', description: '', thumbnail: '', videoUrl: '' }]));
  }
  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateItem(idx, patch) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  async function saveAll() {
    setMsg('');
    const payload = items.map((it) => ({
      id: it.id,
      type: it.type,
      mediaType: it.mediaType,
      title: it.title,
      description: it.description,
      thumbnail: it.thumbnail,
      videoUrl: it.videoUrl || undefined,
      category: it.category || it.type,
    }));
    const r = await authFetch('/api/admin/json/gallery', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMsg(r.ok ? 'Saved' : 'Failed to save');
  }

  return (
    <div className="p-4 space-y-6 text-white">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-sm text-white/70 mb-1">Filter by type</div>
          <select value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)} className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2">
            {types.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div>
          <div className="text-sm text-white/70 mb-1">Search</div>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Find by title or description" className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={addItem} disabled={loading} className="rounded px-3 py-2 bg-white/10 hover:bg-white/15">Add Item</button>
          <button onClick={saveAll} disabled={loading} className="rounded px-4 py-2 bg-yellow-500/90 text-black font-semibold hover:bg-yellow-400">Save All</button>
        </div>
        {msg && <div className="text-sm text-yellow-300">{msg}</div>}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((it, idx) => (
          <div key={it.id || idx} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-yellow-300 font-semibold">{it.title || 'Untitled'}</div>
              <button onClick={()=>removeItem(idx)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="text-sm text-white/70 mb-1">ID</div>
                <input value={it.id} onChange={(e)=>updateItem(idx,{ id: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Type</div>
                <select value={it.type} onChange={(e)=>updateItem(idx,{ type: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2">
                  {types.filter(t=>t!=='All').map((t)=>(<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Media Type</div>
                <select value={it.mediaType} onChange={(e)=>updateItem(idx,{ mediaType: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Title</div>
                <input value={it.title} onChange={(e)=>updateItem(idx,{ title: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Thumbnail URL</div>
                <input value={it.thumbnail || ''} onChange={(e)=>updateItem(idx,{ thumbnail: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" placeholder="/uploads/... or https://..." />
              </div>
              <div className="col-span-2">
                <div className="text-sm text-white/70 mb-1">Description</div>
                <textarea rows={3} value={it.description || ''} onChange={(e)=>updateItem(idx,{ description: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              {it.mediaType === 'video' && (
                <div className="col-span-2">
                  <div className="text-sm text-white/70 mb-1">Video URL (embed)</div>
                  <input value={it.videoUrl || ''} onChange={(e)=>updateItem(idx,{ videoUrl: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" placeholder="https://www.youtube.com/embed/..." />
                </div>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/40">
                {it.mediaType === 'image' && it.thumbnail && (
                  <img src={it.thumbnail} alt={it.title} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                )}
                {it.mediaType === 'video' && it.videoUrl && (
                  <iframe title={it.title} src={it.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                )}
              </div>
              <div className="text-sm text-white/60">Preview</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-white/60">No items. Add one to get started.</div>
        )}
      </div>
    </div>
  );
}
