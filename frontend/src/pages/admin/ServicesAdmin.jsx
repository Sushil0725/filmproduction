import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ServicesAdmin() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    published: true,
    order_index: 0,
  });

  const resetForm = () => {
    setEditing(null);
    setImageFile(null);
    setForm({ title: '', description: '', published: true, order_index: 0 });
  };

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/admin/services');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function editItem(it) {
    setEditing(it);
    setImageFile(null);
    setForm({
      title: it.title || '',
      description: it.description || '',
      published: !!it.published,
      order_index: it.order_index ?? 0,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const isUpdate = !!editing?.id;
      let res;
      if (imageFile) {
        const fd = new FormData();
        fd.append('title', form.title);
        if (form.description) fd.append('description', form.description);
        fd.append('published', String(!!form.published));
        fd.append('order_index', String(parseInt(form.order_index, 10) || 0));
        fd.append('image', imageFile);
        res = await authFetch(isUpdate ? `/api/admin/services/${editing.id}` : '/api/admin/services', {
          method: isUpdate ? 'PUT' : 'POST',
          body: fd,
        });
      } else {
        res = await authFetch(isUpdate ? `/api/admin/services/${editing.id}` : '/api/admin/services', {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, order_index: parseInt(form.order_index, 10) || 0 }),
        });
      }
      if (!res.ok) throw new Error('Save failed');
      await loadItems();
      setSuccess(isUpdate ? 'Updated successfully' : 'Created successfully');
      resetForm();
    } catch (e) {
      setError('Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id) {
    if (!id) return;
    if (!confirm('Delete this service?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await loadItems();
      if (editing?.id === id) resetForm();
      setSuccess('Deleted');
    } catch (e) {
      setError('Failed to delete service');
    }
  }

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (editing?.image_url) return editing.image_url;
    return '';
  }, [imageFile, editing]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Services Manager</h1>
        <button
          onClick={resetForm}
          className="inline-flex items-center rounded-md bg-white/10 px-3 py-2 hover:bg-white/15"
        >
          New Service
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">{error}</div> : null}
      {success ? <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">{success}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="p-3 border-b border-white/10 text-sm">All Services</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Title</th>
                  <th className="text-left px-3 py-2 font-medium">Order</th>
                  <th className="text-left px-3 py-2 font-medium">Published</th>
                  <th className="text-right px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-3 py-3" colSpan={4}>Loading...</td></tr>
                ) : items.length ? (
                  items.map((it) => (
                    <tr key={it.id} className="border-t border-white/5">
                      <td className="px-3 py-2">{it.title}</td>
                      <td className="px-3 py-2">{it.order_index ?? 0}</td>
                      <td className="px-3 py-2">{it.published ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={() => editItem(it)}>Edit</button>
                        <button className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30" onClick={() => deleteItem(it.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="px-3 py-3" colSpan={4}>No services yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="p-3 border-b border-white/10 text-sm">{editing ? 'Edit Service' : 'Create Service'}</div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input name="title" value={form.title} onChange={onChange} required className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Order</label>
                <input name="order_index" type="number" value={form.order_index} onChange={onChange} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={4} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /> Published</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="border border-white/10 rounded-md overflow-hidden h-32 flex items-center justify-center bg-black/30">
                {previewUrl ? <img src={previewUrl} alt="preview" className="max-h-32" /> : <div className="text-xs text-white/50">No image selected</div>}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center rounded-md bg-[#f5c518] text-black px-4 py-2 font-medium hover:bg-[#ffd34d] disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              {editing ? (
                <button type="button" onClick={resetForm} className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 hover:bg-white/15">Cancel</button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
