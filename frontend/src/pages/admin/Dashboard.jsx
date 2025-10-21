import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({ text: [], json: [], uploads: [] });

  useEffect(() => {
    let mounted = true;
    authFetch('/api/admin/list').then(async (r) => {
      if (!mounted) return;
      if (r.ok) setList(await r.json());
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [authFetch]);

  const stats = [
    { label: 'Text Entries', value: list.text?.length || 0 },
    { label: 'JSON Entries', value: list.json?.length || 0 },
    { label: 'Uploads', value: list.uploads?.length || 0 },
  ];

  return (
    <div className="p-4 space-y-8 text-white">
      <div className="flex flex-wrap gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 min-w-[180px] rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-sm">{s.label}</div>
            <div className="mt-2 text-3xl font-bold text-yellow-300">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Recent Uploads</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {(list.uploads || []).slice(0, 12).map((u) => (
              <a key={u.filename} href={u.url} target="_blank" rel="noreferrer" className="block group">
                <div className="aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10">
                  <img src={u.url} alt={u.filename} className="w-full h-full object-cover group-hover:scale-105 transition" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="mt-1 text-xs text-white/70 truncate">{u.filename}</div>
              </a>
            ))}
            {(!list.uploads || list.uploads.length === 0) && (
              <div className="text-white/50">No uploads yet</div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Content Overview</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/70">Text Keys</div>
              <ul className="mt-2 text-sm space-y-1 max-h-56 overflow-auto pr-1">
                {(list.text || []).map((t) => (<li key={t} className="text-white/85">{t}</li>))}
                {(!list.text || list.text.length === 0) && <li className="text-white/50">None</li>}
              </ul>
            </div>
            <div>
              <div className="text-sm text-white/70">JSON Keys</div>
              <ul className="mt-2 text-sm space-y-1 max-h-56 overflow-auto pr-1">
                {(list.json || []).map((j) => (<li key={j} className="text-white/85">{j}</li>))}
                {(!list.json || list.json.length === 0) && <li className="text-white/50">None</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-white/60">Loading...</div>}
    </div>
  );
}
