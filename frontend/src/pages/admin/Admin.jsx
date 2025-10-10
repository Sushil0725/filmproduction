import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Admin() {
  const { authFetch } = useAuth();
  const [list, setList] = useState({ text: [], json: [], uploads: [] });
  const [textName, setTextName] = useState('hero');
  const [textValue, setTextValue] = useState('');
  const [jsonName, setJsonName] = useState('site');
  const [jsonValue, setJsonValue] = useState('{"title":"Film Production House","tagline":"Crafting stories on screen"}');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function refresh() {
    const r = await authFetch('/api/admin/list');
    if (r.ok) setList(await r.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function saveText(e) {
    e.preventDefault();
    setMessage('');
    const r = await authFetch(`/api/admin/text/${encodeURIComponent(textName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: textValue,
    });
    if (r.ok) {
      setMessage('Text saved');
      refresh();
    } else setMessage('Failed to save text');
  }

  async function saveJSON(e) {
    e.preventDefault();
    setMessage('');
    let obj;
    try { obj = JSON.parse(jsonValue); } catch { setMessage('Invalid JSON'); return; }
    const r = await authFetch(`/api/admin/json/${encodeURIComponent(jsonName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj),
    });
    if (r.ok) {
      setMessage('JSON saved');
      refresh();
    } else setMessage('Failed to save JSON');
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    const fd = new FormData();
    fd.append('file', file);
    const r = await authFetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (r.ok) {
      setMessage('Uploaded');
      e.target.value = '';
      refresh();
    } else setMessage('Upload failed');
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {message && <div className="text-sm text-blue-700">{message}</div>}

      <section className="grid md:grid-cols-2 gap-6">
        <form onSubmit={saveText} className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-semibold">Save Text</h2>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded p-2" value={textName} onChange={(e) => setTextName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Content</label>
            <textarea rows={6} className="w-full border rounded p-2" value={textValue} onChange={(e) => setTextValue(e.target.value)} />
          </div>
          <button className="bg-black text-white px-4 py-2 rounded">Save Text</button>
        </form>

        <form onSubmit={saveJSON} className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-semibold">Save JSON</h2>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded p-2" value={jsonName} onChange={(e) => setJsonName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">JSON</label>
            <textarea rows={6} className="w-full border rounded p-2 font-mono" value={jsonValue} onChange={(e) => setJsonValue(e.target.value)} />
          </div>
          <button className="bg-black text-white px-4 py-2 rounded">Save JSON</button>
        </form>
      </section>

      <section className="bg-white border rounded p-4 space-y-3">
        <h2 className="font-semibold">Upload Image/File</h2>
        <input type="file" onChange={onUpload} disabled={uploading} />
      </section>

      <section className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Content List</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Text</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {list.text?.map((t) => <li key={t}>{t}</li>)}
              {(!list.text || list.text.length === 0) && <li className="list-none text-gray-400">No text yet</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">JSON</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {list.json?.map((j) => <li key={j}>{j}</li>)}
              {(!list.json || list.json.length === 0) && <li className="list-none text-gray-400">No JSON yet</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Uploads</h3>
            <div className="grid grid-cols-3 gap-2">
              {list.uploads?.map((u) => (
                <a key={u.filename} className="block text-xs text-blue-600 underline" href={u.url} target="_blank" rel="noreferrer">{u.filename}</a>
              ))}
              {(!list.uploads || list.uploads.length === 0) && <div className="text-gray-400 text-sm">No uploads yet</div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
