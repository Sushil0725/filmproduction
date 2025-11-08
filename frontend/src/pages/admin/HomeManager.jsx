import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function HomeManager() {
  const { authFetch } = useAuth();
  const [active, setActive] = useState('Hero');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const defaultHome = {
    hero: { headline: '', tagline: '', backgroundType: 'image', backgroundImage: '', backgroundVideo: '' },
    highlights: [
      { id: 'h1', title: '', subtitle: '', image: '' },
      { id: 'h2', title: '', subtitle: '', image: '' }
    ],
    services: { selected: [] },
    projects: { selected: [] },
    videos: { selected: [] },
    contact: { address: '', phone: '', email: '', hours: '', social: { facebook: '', instagram: '', youtube: '' } }
  };

  const [homeData, setHomeData] = useState(defaultHome);
  const [allServices, setAllServices] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allVideos, setAllVideos] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/public/json/homepage');
        if (mounted && r.ok) {
          const d = await r.json();
          setHomeData((prev) => ({
            ...prev,
            ...d,
            hero: { ...prev.hero, ...(d.hero || {}) },
            highlights: Array.isArray(d.highlights) && d.highlights.length ? d.highlights : prev.highlights,
            services: { ...prev.services, ...(d.services || {}) },
            projects: { ...prev.projects, ...(d.projects || {}) },
            videos: { ...prev.videos, ...(d.videos || {}) },
            contact: { ...prev.contact, ...(d.contact || {}), social: { ...prev.contact.social, ...(d.contact?.social || {}) } },
          }));
        }
      } catch {}
      try {
        const rs = await authFetch('/api/admin/services?limit=200');
        if (mounted && rs.ok) {
          const j = await rs.json();
          setAllServices(j?.data?.services || []);
        }
      } catch {}
      try {
        const rp = await authFetch('/api/admin/projects?limit=200');
        if (mounted && rp.ok) {
          const j = await rp.json();
          setAllProjects(j?.data?.projects || []);
        }
      } catch {}
      try {
        const rv = await authFetch('/api/admin/videos?limit=200');
        if (mounted && rv.ok) {
          const j = await rv.json();
          setAllVideos(j?.data?.videos || []);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [authFetch]);

  async function saveAll() {
    setSaving(true); setMsg('');
    const r = await authFetch('/api/admin/json/homepage', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(homeData) });
    setSaving(false); setMsg(r.ok ? 'Saved changes' : 'Failed to save');
  }

  function updateField(section, field, value) {
    setHomeData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  }

  function updateArrayItem(section, index, field, value) {
    setHomeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  }

  function updateNestedField(section, nested, field, value) {
    setHomeData(prev => ({
      ...prev,
      [section]: { ...prev[section], [nested]: { ...prev[section][nested], [field]: value } }
    }));
  }

  function toggleSelection(section, id) {
    setHomeData(prev => {
      const sel = prev[section].selected || [];
      const has = sel.includes(id);
      const next = has ? sel.filter(v => v !== id) : [...sel, id];
      return { ...prev, [section]: { ...prev[section], selected: next } };
    });
  }

  function moveSelected(section, from, to) {
    setHomeData(prev => {
      const list = [...(prev[section].selected || [])];
      if (from < 0 || from >= list.length || to < 0 || to >= list.length) return prev;
      const [m] = list.splice(from, 1);
      list.splice(to, 0, m);
      return { ...prev, [section]: { ...prev[section], selected: list } };
    });
  }

  async function uploadImage(file) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await authFetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!r.ok) return null;
      const j = await r.json();
      return j?.url || null;
    } catch {
      return null;
    }
  }

  return (
    <div className="p-4 space-y-4 text-white">
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            {['Hero','Highlights','Services','Projects','Videos','Contact'].map((s) => (
              <button key={s} onClick={() => setActive(s)} className={`w-full text-left px-3 py-2 rounded ${active===s ? 'bg-white/10' : 'hover:bg-white/10'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-9 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">{active}</div>
            <button onClick={saveAll} disabled={saving} className="rounded px-4 py-2 bg-white/10 hover:bg-white/15">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            {active === 'Hero' && (
              <HeroEditor
                data={homeData.hero}
                updateField={updateField}
                uploadImage={uploadImage}
              />
            )}
            {active === 'Highlights' && (
              <HighlightsEditor
                data={homeData.highlights}
                updateArrayItem={updateArrayItem}
                uploadImage={uploadImage}
              />
            )}
            {active === 'Services' && (
              <ServicesEditor
                data={homeData.services}
                available={allServices}
                toggleSelection={toggleSelection}
              />
            )}
            {active === 'Projects' && (
              <ProjectsEditor
                data={homeData.projects}
                available={allProjects}
                toggleSelection={toggleSelection}
                moveSelected={moveSelected}
              />
            )}
            {active === 'Videos' && (
              <VideosEditor
                data={homeData.videos}
                available={allVideos}
                toggleSelection={toggleSelection}
                moveSelected={moveSelected}
              />
            )}
            {active === 'Contact' && (
              <ContactEditor
                data={homeData.contact}
                updateField={(f, v) => updateField('contact', f, v)}
                updateNestedField={updateNestedField}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroEditor({ data, updateField, uploadImage }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Headline</label>
            <input
              value={data.headline}
              onChange={(e)=>updateField('hero','headline', e.target.value)}
              className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
              placeholder="Welcome to MB Pictures"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Tagline</label>
            <input
              value={data.tagline}
              onChange={(e)=>updateField('hero','tagline', e.target.value)}
              className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
              placeholder="Canada's Complete Film & Media Production House"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Background Type</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="bgtype" value="image" checked={data.backgroundType==='image'} onChange={(e)=>updateField('hero','backgroundType', e.target.value)} />
                Image
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="bgtype" value="video" checked={data.backgroundType==='video'} onChange={(e)=>updateField('hero','backgroundType', e.target.value)} />
                Video
              </label>
            </div>
          </div>
          {data.backgroundType === 'image' ? (
            <div>
              <label className="block text-sm text-white/70 mb-1">Background Image</label>
              <input type="file" accept="image/*" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; const url = await uploadImage(f); if (url) updateField('hero','backgroundImage', url); }} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-white/70 mb-1">Background Video URL</label>
              <input
                value={data.backgroundVideo}
                onChange={(e)=>updateField('hero','backgroundVideo', e.target.value)}
                className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden" style={data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50" />
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-bold">{data.headline || 'Your Headline'}</h2>
              <p className="text-white/80">{data.tagline || 'Your tagline here'}</p>
            </div>
            <div className="absolute top-2 right-2 text-xs bg-black/50 px-2 py-1 rounded">
              {data.backgroundType === 'video' ? 'Video' : 'Image'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HighlightsEditor({ data, updateArrayItem, uploadImage }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-3">
          {data.map((h, i) => (
            <div key={h.id || i} className="border border-white/10 rounded p-3 space-y-2">
              <div>
                <label className="block text-sm text-white/70 mb-1">Title</label>
                <input value={h.title} onChange={(e)=>updateArrayItem('highlights', i, 'title', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Subtitle</label>
                <input value={h.subtitle} onChange={(e)=>updateArrayItem('highlights', i, 'subtitle', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; const url = await uploadImage(f); if (url) updateArrayItem('highlights', i, 'image', url); }} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="grid grid-cols-2 gap-3">
            {data.map((h, idx) => (
              <div key={idx} className="bg-neutral-800 rounded p-3">
                <div className="aspect-square rounded mb-2" style={h.image ? { backgroundImage: `url(${h.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#2a2a2a' }} />
                <div className="text-sm font-medium">{h.title || 'Title'}</div>
                <div className="text-xs text-white/60">{h.subtitle || 'Subtitle'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesEditor({ data, available = [], toggleSelection }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="max-h-96 overflow-auto space-y-2">
          {available.map((s) => (
            <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5">
              <input type="checkbox" checked={(data.selected || []).includes(s.id)} onChange={()=>toggleSelection('services', s.id)} />
              <div className="flex-1">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-white/60 truncate">{s.description}</div>
              </div>
            </label>
          ))}
          {available.length === 0 && <div className="text-white/60 text-sm">No services found</div>}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3">
          {(data.selected || []).slice(0,6).map((id) => {
            const s = available.find(a=>a.id===id);
            return s ? (
              <div key={id} className="bg-neutral-800 rounded p-3">
                <div className="aspect-square bg-neutral-700 rounded mb-2" />
                <div className="text-sm font-medium">{s.title}</div>
              </div>
            ) : null;
          })}
          {(data.selected || []).length === 0 && <div className="col-span-2 text-white/50 text-center py-6">No services selected</div>}
        </div>
      </div>
    </div>
  );
}

function ProjectsEditor({ data, available = [], toggleSelection, moveSelected }) {
  const selected = available.filter(p => (data.selected || []).includes(p.id));
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="max-h-96 overflow-auto space-y-2">
          {available.map((p) => (
            <label key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5">
              <input type="checkbox" checked={(data.selected || []).includes(p.id)} onChange={()=>toggleSelection('projects', p.id)} />
              <div className="flex-1">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-white/60">{p.year}</div>
              </div>
            </label>
          ))}
          {available.length === 0 && <div className="text-white/60 text-sm">No projects found</div>}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3">
          {selected.map((p, idx) => (
            <div key={p.id} className="bg-neutral-800 rounded p-3">
              <div className="aspect-video bg-neutral-700 rounded mb-2" />
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-white/60">{p.year}</div>
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-white/10 rounded" onClick={()=>moveSelected('projects', idx, Math.max(0, idx-1))}>Up</button>
                <button className="px-2 py-1 bg-white/10 rounded" onClick={()=>moveSelected('projects', idx, Math.min(selected.length-1, idx+1))}>Down</button>
              </div>
            </div>
          ))}
          {selected.length === 0 && <div className="col-span-2 text-white/50 text-center py-6">No projects selected</div>}
        </div>
      </div>
    </div>
  );
}

function VideosEditor({ data, available = [], toggleSelection, moveSelected }) {
  const selected = available.filter(v => (data.selected || []).includes(v.id));
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="max-h-96 overflow-auto space-y-2">
          {available.map((v) => (
            <label key={v.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5">
              <input type="checkbox" checked={(data.selected || []).includes(v.id)} onChange={()=>toggleSelection('videos', v.id)} />
              <div className="flex-1">
                <div className="font-medium">{v.title}</div>
                <div className="text-xs text-white/60 truncate">{v.youtube_url || v.youtubeUrl}</div>
              </div>
            </label>
          ))}
          {available.length === 0 && <div className="text-white/60 text-sm">No videos found</div>}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3">
          {selected.map((v, idx) => (
            <div key={v.id} className="bg-neutral-800 rounded p-3">
              <div className="aspect-video bg-neutral-700 rounded mb-2" />
              <div className="text-sm font-medium">{v.title}</div>
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-white/10 rounded" onClick={()=>moveSelected('videos', idx, Math.max(0, idx-1))}>Up</button>
                <button className="px-2 py-1 bg-white/10 rounded" onClick={()=>moveSelected('videos', idx, Math.min(selected.length-1, idx+1))}>Down</button>
              </div>
            </div>
          ))}
          {selected.length === 0 && <div className="col-span-2 text-white/50 text-center py-6">No videos selected</div>}
        </div>
      </div>
    </div>
  );
}

function ContactEditor({ data, updateField, updateNestedField }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Address</label>
            <textarea value={data.address} onChange={(e)=>updateField('address', e.target.value)} rows={3} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Phone</label>
              <input value={data.phone} onChange={(e)=>updateField('phone', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input value={data.email} onChange={(e)=>updateField('email', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Working Hours</label>
            <input value={data.hours} onChange={(e)=>updateField('hours', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Facebook</label>
              <input value={data.social?.facebook || ''} onChange={(e)=>updateNestedField('contact','social','facebook', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Instagram</label>
              <input value={data.social?.instagram || ''} onChange={(e)=>updateNestedField('contact','social','instagram', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">YouTube</label>
              <input value={data.social?.youtube || ''} onChange={(e)=>updateNestedField('contact','social','youtube', e.target.value)} className="w-full bg-neutral-800/70 border border-white/10 rounded px-3 py-2" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="bg-neutral-800 rounded p-4 space-y-2">
          {data.address && <div><strong>Address:</strong> {data.address}</div>}
          {data.phone && <div><strong>Phone:</strong> {data.phone}</div>}
          {data.email && <div><strong>Email:</strong> {data.email}</div>}
          {data.hours && <div><strong>Hours:</strong> {data.hours}</div>}
          {(data.social?.facebook || data.social?.instagram || data.social?.youtube) && (
            <div className="pt-2 border-t border-white/10">
              <strong>Follow Us:</strong>
              <div className="flex gap-2 mt-1 text-xs">
                {data.social?.facebook && <span className="text-blue-400">FB</span>}
                {data.social?.instagram && <span className="text-pink-400">IG</span>}
                {data.social?.youtube && <span className="text-red-400">YT</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
