import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function MediaControl() {
  const { authFetch } = useAuth();
  const [files, setFiles] = useState([]); // from /api/admin/uploads
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return files.filter(f => (f.original_name || f.filename || '').toLowerCase().includes(q));
  }, [files, query]);

  const fileUrl = (f) => {
    // Prefer explicit URL fields from API responses; otherwise derive from stored category/filename
    if (f.url) return f.url;
    if (f.file_url) return f.file_url;
    if (f.category && f.filename) return `/uploads/${f.category}/${f.filename}`;
    if (f.filename) return `/uploads/${f.filename}`; // legacy flat uploads
    return '';
  };

  async function refresh(page = 1, limit = 60) {
    const r = await authFetch(`/api/admin/uploads?category=images&page=${page}&limit=${limit}`);
    if (r.ok) {
      const d = await r.json();
      const list = d?.data?.files || [];
      setFiles(list);
    }
  }

  useEffect(() => { refresh(); }, []);

  // Clipboard paste support
  useEffect(() => {
    function onPaste(e) {
      const items = e.clipboardData?.items || [];
      const imgs = [];
      for (const it of items) {
        if (it.kind === 'file') {
          const f = it.getAsFile();
          if (f && f.type.startsWith('image/')) imgs.push(f);
        }
      }
      if (imgs.length) {
        e.preventDefault();
        handleUpload(imgs);
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  async function handleUpload(fileList) {
    const list = Array.from(fileList).filter(f => f && f.type.startsWith('image/'));
    if (!list.length) return;
    setUploading(true);
    setMessage('');
    const fd = new FormData();
    fd.append('category', 'images');
    list.forEach(f => fd.append('files', f));
    const r = await authFetch('/api/admin/uploads/multiple', { method: 'POST', body: fd });
    setUploading(false);
    if (r.ok) {
      setMessage(`${list.length} image(s) uploaded`);
      refresh();
      // clear file input
      try { if (inputRef.current) inputRef.current.value = ''; } catch {}
      setTimeout(() => setMessage(''), 1500);
    } else setMessage('Upload failed');
  }

  function onBrowseChange(e) {
    const fl = e.target.files;
    if (fl?.length) handleUpload(fl);
  }

  function onDragOver(e) { e.preventDefault(); setDragOver(true); }
  function onDragLeave(e) { e.preventDefault(); setDragOver(false); }
  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const fl = e.dataTransfer?.files;
    if (fl?.length) handleUpload(fl);
  }

  async function onDelete(id) {
    if (!id) return;
    const ok = window.confirm('Delete this file? This action cannot be undone.');
    if (!ok) return;
    const r = await authFetch(`/api/admin/uploads/${id}`, { method: 'DELETE' });
    if (r.ok) {
      setMessage('Deleted');
      refresh();
      setTimeout(() => setMessage(''), 1200);
    } else {
      setMessage('Failed to delete');
    }
  }

  function copy(text) {
    try { navigator.clipboard.writeText(text); setMessage('Copied'); setTimeout(() => setMessage(''), 1200); } catch {}
  }

  return (
    <div className="p-4 space-y-6 text-white">
      {/* Upload area */}
      <div
        className={`relative rounded-2xl border-2 ${dragOver ? 'border-yellow-400/80 bg-white/10' : 'border-dashed border-white/20 bg-white/5'} p-8 text-center transition`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-yellow-300" fill="currentColor"><path d="M12 2L6.5 7.5h3v6h5v-6h3L12 2zM5 19h14v2H5z" /></svg>
          </div>
          <div className="text-lg font-semibold">Drop, Upload or Paste Images</div>
          <div className="text-xs text-white/70">JPG, PNG, GIF, WEBP, SVG</div>
          <div className="mt-2">
            <label className="inline-block">
              <span className="inline-flex items-center rounded-full bg-yellow-500/90 hover:bg-yellow-400 px-4 py-2 text-black font-medium cursor-pointer">Browse</span>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onBrowseChange} />
            </label>
          </div>
          {uploading && <div className="text-sm text-yellow-300 mt-2">Uploading...</div>}
          {message && !uploading && <div className="text-sm text-yellow-300 mt-2">{message}</div>}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/70">Recent uploads are shown first</div>
        <div>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name" className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((f) => (
          <div key={f.id} className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="aspect-square bg-black/40 relative">
              <img src={fileUrl(f)} alt={f.original_name || f.filename} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/40 flex items-center justify-center gap-2">
                <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>copy(fileUrl(f))}>Copy URL</button>
                <a className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" href={fileUrl(f)} target="_blank" rel="noreferrer">Open</a>
                <button className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-black font-semibold" onClick={()=>onDelete(f.id)}>Delete</button>
              </div>
            </div>
            <div className="p-2">
              <div className="text-xs truncate" title={f.original_name || f.filename}>{f.original_name || f.filename}</div>
              <div className="text-[10px] text-white/50">{new Date(f.created_at).toLocaleString?.() || ''}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-white/60">No uploads found.</div>
        )}
      </div>
    </div>
  );
}
