import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function MediaControl() {
  const { authFetch } = useAuth();
  const [files, setFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [category, setCategory] = useState('images');
  const [storageType, setStorageType] = useState('backend'); // backend or cloud
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    files: [],
    filename: '',
    youtubeUrl: '',
    category: 'images'
  });
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const itemsPerPage = 20;

  const filtered = useMemo(() => {
    let items = [...files, ...videos];
    const q = query.toLowerCase();
    items = items.filter(item =>
      (item.original_name || item.filename || item.title || '').toLowerCase().includes(q)
    );

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      items = items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort by recent first
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return items;
  }, [files, videos, query, dateFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [filtered]);

  const fileUrl = (f) => {
    if (f.url) return f.url;
    if (f.file_url) return f.file_url;
    if (f.category && f.filename) return `/uploads/${f.category}/${f.filename}`;
    if (f.filename) return `/uploads/${f.filename}`;
    return '';
  };

  async function refresh(page = 1, limit = itemsPerPage) {
    // Fetch images
    const r1 = await authFetch(`/api/admin/uploads?category=${category}&page=${page}&limit=${limit}`);
    if (r1.ok) {
      const d1 = await r1.json();
      setFiles(d1?.data?.files || []);
    }

    // Fetch videos (assuming a videos endpoint)
    const r2 = await authFetch(`/api/admin/videos?page=${page}&limit=${limit}`);
    if (r2.ok) {
      const d2 = await r2.json();
      setVideos(d2?.data?.videos || []);
    }
  }

  useEffect(() => {
    refresh();
  }, [category]);

  // Clipboard paste support
  useEffect(() => {
    function onPaste(e) {
      const items = e.clipboardData?.items || [];
      const imgs = [];
      for (const it of items) {
        if (it.kind === 'file') {
          const f = it.getAsFile();
          if (f && (f.type.startsWith('image/') || f.type.startsWith('video/'))) imgs.push(f);
        }
      }
      if (imgs.length) {
        e.preventDefault();
        setUploadForm(prev => ({ ...prev, files: imgs }));
        setShowUploadForm(true);
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  async function handleUpload() {
    if (!uploadForm.files.length && !uploadForm.youtubeUrl) return;

    setUploading(true);
    setMessage('');

    try {
      if (uploadForm.youtubeUrl) {
        // Handle video upload via URL
        const payload = {
          title: uploadForm.filename,
          url: uploadForm.youtubeUrl,
          category: uploadForm.category,
          type: 'video'
        };
        const r = await authFetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (r.ok) {
          setMessage('Video added successfully');
          refresh();
        } else {
          setMessage('Failed to add video');
        }
      } else {
        // Handle file upload
        const fd = new FormData();
        fd.append('category', uploadForm.category);
        fd.append('storageType', storageType);
        fd.append('filename', uploadForm.filename);
        uploadForm.files.forEach(f => fd.append('files', f));

        const endpoint = storageType === 'cloud' ? '/api/admin/uploads/cloud' : '/api/admin/uploads/multiple';
        const r = await authFetch(endpoint, { method: 'POST', body: fd });

        if (r.ok) {
          setMessage(`${uploadForm.files.length} file(s) uploaded`);
          refresh();
        } else {
          setMessage('Upload failed');
        }
      }
    } catch (error) {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
      setShowUploadForm(false);
      setUploadForm({ files: [], filename: '', youtubeUrl: '', category: 'images' });
      setTimeout(() => setMessage(''), 2000);
    }
  }

  function onBrowseChange(e) {
    const fl = e.target.files;
    if (fl?.length) {
      setUploadForm(prev => ({ ...prev, files: Array.from(fl) }));
      setShowUploadForm(true);
    }
  }

  function onDragOver(e) { e.preventDefault(); setDragOver(true); }
  function onDragLeave(e) { e.preventDefault(); setDragOver(false); }
  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const fl = e.dataTransfer?.files;
    if (fl?.length) {
      setUploadForm(prev => ({ ...prev, files: Array.from(fl) }));
      setShowUploadForm(true);
    }
  }

  async function onDelete(id, type) {
    if (!id) return;
    const ok = window.confirm('Delete this file? This action cannot be undone.');
    if (!ok) return;
    const endpoint = type === 'video' ? `/api/admin/videos/${id}` : `/api/admin/uploads/${id}`;
    const r = await authFetch(endpoint, { method: 'DELETE' });
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
          <div className="text-lg font-semibold">Drop, Upload or Paste Media</div>
          <div className="text-xs text-white/70">Images, Videos, or YouTube URLs</div>
          <div className="mt-2 flex gap-2">
            <label className="inline-block">
              <span className="inline-flex items-center rounded-full bg-yellow-500/90 hover:bg-yellow-400 px-4 py-2 text-black font-medium cursor-pointer">Browse Files</span>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onBrowseChange} />
            </label>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center rounded-full bg-blue-500/90 hover:bg-blue-400 px-4 py-2 text-white font-medium"
            >
              Add Video URL
            </button>
          </div>
          {uploading && <div className="text-sm text-yellow-300 mt-2">Uploading...</div>}
          {message && !uploading && <div className={`text-sm mt-2 ${message.includes('failed') || message.includes('Failed') ? 'text-red-300' : 'text-green-300'}`}>{message}</div>}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
          >
            <option value="images">Images</option>
            <option value="videos">Videos</option>
            <option value="documents">Documents</option>
          </select>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
          />
        </div>
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Media</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Storage Location</label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
                >
                  <option value="backend">Backend Uploads Folder</option>
                  <option value="cloud">Cloudinary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Filename</label>
                <input
                  value={uploadForm.filename}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder="Enter filename"
                  className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
                >
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                  <option value="documents">Documents</option>
                </select>
              </div>
              {uploadForm.category === 'videos' && (
                <div>
                  <label className="block text-sm text-white/70 mb-1">YouTube URL</label>
                  <input
                    value={uploadForm.youtubeUrl}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-yellow-500/90 text-black font-semibold py-2 px-4 rounded hover:bg-yellow-400"
                >
                  {uploadForm.youtubeUrl ? 'Add Video' : 'Upload'}
                </button>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Content Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginatedItems.map((item) => (
            <div key={item.id} className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="aspect-square bg-black/40 relative">
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white/50"><path fill="currentColor" d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/></svg>
                  </div>
                ) : (
                  <img src={fileUrl(item)} alt={item.original_name || item.filename || item.title} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/40 flex items-center justify-center gap-2">
                  <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>copy(fileUrl(item) || item.url)}>Copy URL</button>
                  <a className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" href={fileUrl(item) || item.url} target="_blank" rel="noreferrer">Open</a>
                  <button className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-black font-semibold" onClick={()=>onDelete(item.id, item.type)}>Delete</button>
                </div>
              </div>
              <div className="p-2">
                <div className="text-xs truncate" title={item.original_name || item.filename || item.title}>{item.original_name || item.filename || item.title}</div>
                <div className="text-[10px] text-white/50">{new Date(item.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedItems.map((item) => (
            <div key={item.id} className="flex items-center rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="w-16 h-16 bg-black/40 rounded-lg flex-shrink-0 mr-3">
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/50"><path fill="currentColor" d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/></svg>
                  </div>
                ) : (
                  <img src={fileUrl(item)} alt={item.original_name || item.filename || item.title} className="w-full h-full object-cover rounded-lg" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.original_name || item.filename || item.title}</div>
                <div className="text-sm text-white/70">{new Date(item.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>copy(fileUrl(item) || item.url)}>Copy URL</button>
                <button className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-black font-semibold" onClick={()=>onDelete(item.id, item.type)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {paginatedItems.length === 0 && (
        <div className="text-white/60 text-center py-8">No media found.</div>
      )}
    </div>
  );
}
