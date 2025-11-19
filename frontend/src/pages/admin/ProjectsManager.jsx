import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function MediaPicker({ open, onClose, onSelect, filetype }) {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20', filetype });
        if (search) params.append('search', search);
        const r = await authFetch(`/api/admin/media?${params.toString()}`);
        if (r.ok) {
          const d = await r.json();
          setItems(d?.data?.media || []);
          setTotalPages(d?.data?.pagination?.totalPages || 1);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, page, search, filetype, authFetch]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-5xl bg-zinc-900 rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-yellow-300">Select {filetype}</div>
          <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/15" onClick={onClose}>Close</button>
        </div>
        <div className="mt-3 flex gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-neutral-800/70 border border-white/10 rounded p-2" />
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading && <div className="col-span-full text-white/60">Loading...</div>}
          {!loading && items.map(m => (
            <button key={m.id} onClick={()=>{ onSelect?.(m); onClose?.(); }} className="group relative aspect-[16/9] rounded-lg overflow-hidden border border-white/10 bg-black/50 hover:border-yellow-400">
              {filetype === 'image' ? (
                <img src={m.fileurl} alt={m.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-yellow-200/80 text-sm p-2">{m.filename}</div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-xs p-1 truncate">{m.filename}</div>
            </button>
          ))}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-white/60">No media found.</div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-white/60 text-sm">Page {page} / {totalPages}</div>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded bg-white/10 enabled:hover:bg-white/15 disabled:opacity-50">Prev</button>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-white/10 enabled:hover:bg-white/15 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsManager() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState('image');
  const [pickerForId, setPickerForId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append('search', search);
      const r = await authFetch(`/api/admin/projects?${params.toString()}`);
      if (r.ok) {
        const d = await r.json();
        setItems(Array.isArray(d?.data?.projects) ? d.data.projects : []);
        setTotalPages(d?.data?.pagination?.totalPages || 1);
      } else {
        setMessage('Failed to load projects');
      }
    } catch (e) {
      setMessage('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, search]);

  function addItem() {
    setItems(prev => ([{ __temp: true, title: '', description: '', genre: '', status: '', year: '', written_by: '', directed_by: '', executive_producer: '', produced_by: '', thumbnail_id: null, video_id: null }, ...prev]));
  }

  function updateLocal(idOrIndex, patch) {
    setItems(prev => prev.map((it, i) => (it.__temp ? i === idOrIndex : it.id === idOrIndex) ? { ...it, ...patch } : it));
  }

  async function saveItem(it, idx) {
    setMessage('');
    if (it.__temp) {
      const body = { ...it };
      delete body.__temp;
      const r = await authFetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) { await load(); setMessage('Created'); }
      else setMessage('Failed to create');
    } else {
      const body = { ...it };
      delete body.id; delete body.thumbnail_url; delete body.video_url;
      const r = await authFetch(`/api/admin/projects/${it.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) { await load(); setMessage('Saved'); }
      else setMessage('Failed to save');
    }
  }

  async function deleteItem(it) {
    if (it.__temp) {
      setItems(prev => prev.filter(p => p !== it));
      return;
    }
    if (!window.confirm('Delete this project?')) return;
    const r = await authFetch(`/api/admin/projects/${it.id}`, { method: 'DELETE' });
    if (r.ok) { await load(); setMessage('Deleted'); } else setMessage('Failed to delete');
  }

  function openPicker(forId, type) {
    setPickerForId(forId);
    setPickerType(type);
    setPickerOpen(true);
  }

  function handleSelectMedia(m) {
    setItems(prev => prev.map((it, i) => {
      const isTarget = typeof pickerForId === 'number' ? i === pickerForId : it.id === pickerForId;
      if (!isTarget) return it;
      const patch = pickerType === 'image' ? { thumbnail_id: m.id, thumbnail_url: m.fileurl } : { video_id: m.id, video_url: m.fileurl };
      return { ...it, ...patch };
    }));
  }

  return (
    <div className="p-4 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Projects Manager</div>
        <div className="flex gap-2 items-center">
          <input value={search} onChange={(e)=>{ setPage(1); setSearch(e.target.value); }} placeholder="Search..." className="bg-neutral-800/70 border border-white/10 rounded p-2" />
          <button onClick={addItem} disabled={loading} className="rounded px-3 py-2 bg-white/10 hover:bg-white/15">Add Project</button>
        </div>
      </div>
      {message && <div className="text-sm text-yellow-300">{message}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p, idx) => (
          <div key={p.id || `temp-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-yellow-300 font-semibold truncate">{p.title || 'Untitled'}</div>
              <div className="flex gap-2">
                <button onClick={()=>saveItem(p, idx)} className="text-xs px-2 py-1 rounded bg-yellow-500/90 text-black hover:bg-yellow-400">{p.__temp ? 'Create' : 'Save'}</button>
                <button onClick={()=>deleteItem(p)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Delete</button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="text-sm text-white/70 mb-1">Title</div>
                <input value={p.title || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { title: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Genre</div>
                <input value={p.genre || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { genre: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Year</div>
                <input value={p.year ?? ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { year: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Status</div>
                <input value={p.status || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { status: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Directed By</div>
                <input value={p.directed_by || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { directed_by: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Written By</div>
                <input value={p.written_by || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { written_by: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Executive Producer</div>
                <input value={p.executive_producer || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { executive_producer: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Produced By</div>
                <input value={p.produced_by || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { produced_by: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2" />
              </div>
              <div className="col-span-2">
                <div className="text-sm text-white/70 mb-1">Description</div>
                <textarea value={p.description || ''} onChange={(e)=>updateLocal(p.__temp?idx:p.id, { description: e.target.value })} className="w-full bg-neutral-800/70 border border-white/10 rounded p-2 min-h-[80px]" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="col-span-2 text-sm text-white/70">Thumbnail</div>
              <div className="col-span-2 flex gap-2 items-center">
                <div className="w-28 aspect-video rounded overflow-hidden border border-white/10 bg-black/50">
                  {p.thumbnail_url && <img src={p.thumbnail_url} alt="thumb" className="w-full h-full object-cover" />}
                </div>
                <button onClick={()=>openPicker(p.__temp?idx:p.id, 'image')} className="px-3 py-1 rounded bg-white/10 hover:bg-white/15">Select Image</button>
                {p.thumbnail_id && <div className="text-xs text-white/60">ID: {p.thumbnail_id}</div>}
              </div>
              <div className="col-span-2 text-sm text-white/70">Video</div>
              <div className="col-span-2 flex gap-2 items-center">
                <div className="w-28 aspect-video rounded overflow-hidden border border-white/10 bg-black/50">
                  {p.video_url && (
                    <div className="w-full h-full flex items-center justify-center text-[10px] p-1 text-white/80">{p.video_url}</div>
                  )}
                </div>
                <button onClick={()=>openPicker(p.__temp?idx:p.id, 'video')} className="px-3 py-1 rounded bg-white/10 hover:bg-white/15">Select Video</button>
                {p.video_id && <div className="text-xs text-white/60">ID: {p.video_id}</div>}
              </div>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-white/60">No projects yet. Add one to get started.</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-white/60 text-sm">Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded bg-white/10 enabled:hover:bg-white/15 disabled:opacity-50">Prev</button>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-white/10 enabled:hover:bg-white/15 disabled:opacity-50">Next</button>
        </div>
      </div>

      <MediaPicker open={pickerOpen} onClose={()=>setPickerOpen(false)} onSelect={handleSelectMedia} filetype={pickerType} />
    </div>
  );
}
