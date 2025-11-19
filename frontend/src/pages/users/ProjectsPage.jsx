import React, { useEffect, useMemo, useState } from 'react';
import ProjectCard from '../../components/users/ProjectCard';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '100' });
        const r = await fetch(`/api/public/projects?${params.toString()}`);
        if (mounted && r.ok) {
          const data = await r.json();
          const list = Array.isArray(data?.data?.projects) ? data.data.projects : [];
          setItems(list);
          const genreSet = new Set(list.map(p => (p.genre || 'Other')));
          setTypes(Array.from(genreSet));
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => { mounted = false; };
  }, []);

  const toggleType = (type) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTypes(new Set());
  };

  const normalize = (s) => (s || '').toLowerCase();

  const filteredProjects = useMemo(() => {
    let filtered = items;

    if (selectedTypes.size > 0) {
      filtered = filtered.filter((p) => selectedTypes.has(p.genre || 'Other'));
    }

    const q = normalize(search);
    if (q) {
      filtered = filtered.filter(
        (p) => normalize(p.title).includes(q) || normalize(p.description).includes(q)
      );
    }

    return filtered;
  }, [items, search, selectedTypes]);

  return (
    <div className="bg-black text-yellow-50 min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-20 pt-24 pb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Projects</h1>
          <p className="mt-4 max-w-2xl text-yellow-100/85">
            Selected films, documentaries, music videos, and art projects crafted by our team.
          </p>
        </div>
      </section>

      {/* Projects Grid with fixed left sidebar */}
      <section className="py-10">
        <div className="relative">
          {/* Fixed sidebar on the far left */}
          <aside className="hidden lg:block fixed left-0 top-24 bottom-0 w-64 border-r border-yellow-500/30 bg-black/90 overflow-y-auto p-4">
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wide text-yellow-300/80">Filter by name</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search..."
                  className="mt-2 w-full bg-zinc-900/60 border border-yellow-500/30 p-2 text-yellow-50 placeholder:text-yellow-100/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/60"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-300">Project Types</h3>
                <button onClick={clearFilters} className="text-xs text-yellow-200/80 hover:text-yellow-100 underline">Clear</button>
              </div>
              <div className="max-h-[60vh] overflow-auto pr-1 space-y-2">
                {types.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(type)}
                      onChange={() => toggleType(type)}
                      className="h-4 w-4 border-yellow-500/40 bg-black/60 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-yellow-100/90">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile filters (collapsible/simple) */}
          <div className="lg:hidden px-4">
            <div className="space-y-4 border border-yellow-500/30 rounded-2xl p-4 bg-black/50">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name"
                className="w-full bg-zinc-900/60 border border-yellow-500/30 p-2 text-yellow-50 placeholder:text-yellow-100/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/60"
              />
              <div className="grid grid-cols-2 gap-2">
                {types.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(type)}
                      onChange={() => toggleType(type)}
                      className="h-4 w-4 border-yellow-500/40 bg-black/60 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-yellow-100/90">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Content area shifted to the right of fixed sidebar */}
          <div className="px-4 lg:pl-[280px]">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-10">
              {filteredProjects.map((p) => (
                <ProjectCard key={p.id} image={p.thumbnail_url} title={p.title} subtitle={p.genre || p.year || ''} />
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-yellow-100/60 text-lg">No projects found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Want to see more?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">Contact us for a full portfolio or to request project-specific reels.</p>
          <div className="mt-6">
            <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">Email Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}