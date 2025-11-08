import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({ text: [], json: [], uploads: [] });
  const [todos, setTodos] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0 });
  const [projects, setProjects] = useState({ total: 0 });
  const [services, setServices] = useState({ total: 0 });
  const [gallery, setGallery] = useState({ total: 0, images: 0, videos: 0 });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch basic content list
        const r1 = await authFetch('/api/admin/list');
        if (mounted && r1.ok) setList(await r1.json());

        // Fetch todos stats
        const r2 = await authFetch('/api/admin/todos/stats');
        if (mounted && r2.ok) setTodos(await r2.json());

        // Fetch projects stats
        const r3 = await authFetch('/api/admin/projects/stats');
        if (mounted && r3.ok) setProjects(await r3.json());

        // Fetch services stats
        const r4 = await authFetch('/api/admin/services/stats');
        if (mounted && r4.ok) setServices(await r4.json());

        // Fetch gallery stats (assuming endpoint exists or use public)
        const r5 = await authFetch('/api/public/json/gallery');
        if (mounted && r5.ok) {
          const data = await r5.json();
          const total = data?.length || 0;
          const images = data?.filter(item => item.mediaType === 'image').length || 0;
          const videos = data?.filter(item => item.mediaType === 'video').length || 0;
          setGallery({ total, images, videos });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [authFetch]);

  const stats = [
    { label: 'Total Photos on Cloud', value: gallery.images || 0, color: 'text-blue-300' },
    { label: 'Total Photos on Uploads', value: list.uploads?.length || 0, color: 'text-green-300' },
    { label: 'Total Photos', value: (gallery.images || 0) + (list.uploads?.length || 0), color: 'text-purple-300' },
    { label: 'Total Storage', value: `${(list.uploads?.length || 0)} MB`, color: 'text-yellow-300' },
    { label: 'Total Videos', value: gallery.videos || 0, color: 'text-red-300' },
    { label: 'Total Services', value: services.total || 0, color: 'text-cyan-300' },
    { label: 'Total Projects', value: projects.total || 0, color: 'text-orange-300' },
    { label: 'Todos', value: todos.total || 0, color: 'text-pink-300' },
  ];

  return (
    <div className="p-4 space-y-8 text-white">
      <div className="text-2xl font-bold mb-6">Dashboard Overview</div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
            <div className="text-white/60 text-sm mb-2">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Recent Uploads</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-auto">
            {(list.uploads || []).slice(0, 12).map((u) => (
              <a key={u.filename} href={u.url} target="_blank" rel="noreferrer" className="block group">
                <div className="aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10">
                  <img src={u.url} alt={u.filename} className="w-full h-full object-cover group-hover:scale-105 transition" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="mt-1 text-xs text-white/70 truncate">{u.filename}</div>
              </a>
            ))}
            {(!list.uploads || list.uploads.length === 0) && (
              <div className="col-span-full text-white/50 text-center">No uploads yet</div>
            )}
          </div>
        </div>

        {/* Task Summary */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Task Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pending Tasks</span>
              <span className="text-yellow-300 font-semibold">{todos.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">In Progress</span>
              <span className="text-blue-300 font-semibold">{todos.inProgress || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Completed</span>
              <span className="text-green-300 font-semibold">{todos.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">High Priority</span>
              <span className="text-red-300 font-semibold">{todos.highPriority || 0}</span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Total Tasks</span>
                <span className="text-indigo-300 font-semibold text-lg">{todos.total || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Content Overview</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/70 mb-2">Text Keys ({list.text?.length || 0})</div>
              <ul className="text-sm space-y-1 max-h-32 overflow-auto pr-1">
                {(list.text || []).slice(0, 8).map((t) => (<li key={t} className="text-white/85 truncate">{t}</li>))}
                {(!list.text || list.text.length === 0) && <li className="text-white/50">None</li>}
              </ul>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-2">JSON Keys ({list.json?.length || 0})</div>
              <ul className="text-sm space-y-1 max-h-32 overflow-auto pr-1">
                {(list.json || []).slice(0, 8).map((j) => (<li key={j} className="text-white/85 truncate">{j}</li>))}
                {(!list.json || list.json.length === 0) && <li className="text-white/50">None</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Media Breakdown */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Media Breakdown</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Gallery Items</span>
              <span className="text-purple-300 font-semibold">{gallery.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Storage by Images in Cloud</span>
              <span className="text-green-300 font-semibold">{gallery.images ? `${gallery.images * 2} MB` : '0 MB'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Storage in Backend Uploads</span>
              <span className="text-blue-300 font-semibold">{list.uploads?.length ? `${list.uploads.length * 1.5} MB` : '0 MB'}</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-white/60 text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
            Loading dashboard data...
          </div>
        </div>
      )}
    </div>
  );
}
