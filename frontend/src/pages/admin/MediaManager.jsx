import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * MediaManager - Comprehensive media management dashboard
 * Handles Images (Cloudinary/Backend), Videos (YouTube), and JSON files
 */
export default function MediaManager() {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('images');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Shared state for all tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Tab-specific state
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [jsonFiles, setJsonFiles] = useState([]);

  // Upload modals
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [showJsonUploadModal, setShowJsonUploadModal] = useState(false);

  // Preview modals
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Upload form states
  const [imageUploadForm, setImageUploadForm] = useState({
    files: [],
    storageType: 'backend',
    category: 'images',
    altText: ''
  });

  const [videoUploadForm, setVideoUploadForm] = useState({
    title: '',
    youtubeUrl: '',
    description: ''
  });

  const [jsonUploadForm, setJsonUploadForm] = useState({
    files: [],
    filename: ''
  });

  // Refs for drag and drop
  const imageDropRef = useRef(null);
  const jsonDropRef = useRef(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'images') {
          const r = await authFetch(`/api/admin/uploads?category=images&page=${currentPage}&limit=${itemsPerPage}`);
          if (r.ok) {
            const d = await r.json();
            setImages(d?.data?.files || []);
          }
        } else if (activeTab === 'videos') {
          const r = await authFetch(`/api/admin/videos?page=${currentPage}&limit=${itemsPerPage}`);
          if (r.ok) {
            const d = await r.json();
            setVideos(d?.data?.videos || []);
          }
        } else if (activeTab === 'json') {
          const r = await authFetch(`/api/admin/json-files?page=${currentPage}&limit=${itemsPerPage}`);
          if (r.ok) {
            const d = await r.json();
            setJsonFiles(d?.data?.files || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, currentPage, authFetch]);

  // Filter and paginate data
  const filteredData = useMemo(() => {
    let data = [];
    if (activeTab === 'images') data = images;
    else if (activeTab === 'videos') data = videos;
    else if (activeTab === 'json') data = jsonFiles;

    // Search filter
    if (searchQuery) {
      data = data.filter(item =>
        (item.title || item.filename || item.original_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by recent first
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return data;
  }, [images, videos, jsonFiles, activeTab, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Generic upload handler
  async function handleUpload(type, formData, endpoint) {
    setUploading(true);
    setMessage('');

    try {
      const r = await authFetch(endpoint, {
        method: 'POST',
        headers: type === 'json' ? { 'Content-Type': 'application/json' } : undefined,
        body: type === 'json' ? JSON.stringify(formData) : formData
      });

      if (r.ok) {
        setMessage(`${type === 'image' ? 'Images' : type === 'video' ? 'Video' : 'JSON files'} uploaded successfully`);
        refreshTab();
      } else {
        setMessage('Upload failed');
      }
    } catch (error) {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // Refresh current tab data
  function refreshTab() {
    setCurrentPage(1);
    // The useEffect will refetch data
  }

  // Delete handler
  async function handleDelete(id, type) {
    if (!window.confirm('Delete this item? This action cannot be undone.')) return;

    const endpoint = `/api/admin/${type === 'video' ? 'videos' : type === 'json' ? 'json-files' : 'uploads'}/${id}`;
    const r = await authFetch(endpoint, { method: 'DELETE' });

    if (r.ok) {
      setMessage('Deleted successfully');
      refreshTab();
    } else {
      setMessage('Failed to delete');
    }
    setTimeout(() => setMessage(''), 2000);
  }

  // Copy URL handler
  function copyUrl(url) {
    try {
      navigator.clipboard.writeText(url);
      setMessage('URL copied');
      setTimeout(() => setMessage(''), 1200);
    } catch (error) {
      setMessage('Failed to copy');
    }
  }

  // Get YouTube thumbnail URL
  function getYouTubeThumbnail(url) {
    try {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    } catch {
      return null;
    }
  }

  // Render tab content
  const renderTabContent = () => {
    const commonProps = {
      data: paginatedData,
      loading,
      viewMode,
      currentPage,
      totalPages: Math.ceil(filteredData.length / itemsPerPage),
      onPageChange: setCurrentPage,
      onSearch: setSearchQuery,
      onDelete: handleDelete,
      onCopy: copyUrl,
      onPreview: (item) => { setPreviewItem(item); setShowPreviewModal(true); }
    };

    switch (activeTab) {
      case 'images':
        return <ImagesTab {...commonProps} onUpload={() => setShowImageUploadModal(true)} />;
      case 'videos':
        return <VideosTab {...commonProps} onUpload={() => setShowVideoUploadModal(true)} />;
      case 'json':
        return <JsonTab {...commonProps} onUpload={() => setShowJsonUploadModal(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Manager</h1>
        <div className="text-sm text-white/60">
          {filteredData.length} items • Page {currentPage}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'images', label: '🖼️ Images', count: images.length },
          { id: 'videos', label: '🎥 Videos', count: videos.length },
          { id: 'json', label: '📁 JSON Files', count: jsonFiles.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
          />
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-neutral-800/70 border border-white/10 rounded px-3 py-2"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
        </div>
        <button
          onClick={refreshTab}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/15"
        >
          Refresh
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Upload Modals */}
      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        formData={imageUploadForm}
        setFormData={setImageUploadForm}
        onUpload={() => handleUpload('image', imageUploadForm, '/api/admin/uploads/multiple')}
        uploading={uploading}
      />

      <VideoUploadModal
        isOpen={showVideoUploadModal}
        onClose={() => setShowVideoUploadModal(false)}
        formData={videoUploadForm}
        setFormData={setVideoUploadForm}
        onUpload={() => handleUpload('video', videoUploadForm, '/api/admin/videos')}
        uploading={uploading}
      />

      <JsonUploadModal
        isOpen={showJsonUploadModal}
        onClose={() => setShowJsonUploadModal(false)}
        formData={jsonUploadForm}
        setFormData={setJsonUploadForm}
        onUpload={() => handleUpload('json', jsonUploadForm, '/api/admin/json-files')}
        uploading={uploading}
      />

      {/* Preview Modal */}
      {showPreviewModal && previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => { setShowPreviewModal(false); setPreviewItem(null); }}
        />
      )}

      {/* Messages */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm ${
          message.includes('failed') || message.includes('Failed')
            ? 'bg-red-500/20 text-red-300'
            : 'bg-green-500/20 text-green-300'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

// Individual Tab Components
function ImagesTab({ data, loading, viewMode, onUpload, onDelete, onCopy, onPreview }) {
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-yellow-300" fill="currentColor">
              <path d="M12 2L6.5 7.5h3v6h5v-6h3L12 2zM5 19h14v2H5z" />
            </svg>
          </div>
          <div className="text-lg font-semibold">Drop Images or Click to Upload</div>
          <div className="text-xs text-white/70">JPG, PNG, GIF, WEBP</div>
          <button
            onClick={onUpload}
            className="mt-2 px-4 py-2 bg-yellow-500/90 hover:bg-yellow-400 text-black font-medium rounded"
          >
            Upload Images
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300 mx-auto"></div>
          <div className="mt-2 text-white/60">Loading images...</div>
        </div>
      ) : (
        <MediaGrid
          data={data}
          viewMode={viewMode}
          type="image"
          onDelete={onDelete}
          onCopy={onCopy}
          onPreview={onPreview}
        />
      )}
    </div>
  );
}

function VideosTab({ data, loading, viewMode, onUpload, onDelete, onCopy, onPreview }) {
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-300" fill="currentColor">
              <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/>
            </svg>
          </div>
          <div className="text-lg font-semibold">Add YouTube Videos</div>
          <div className="text-xs text-white/70">Enter title and YouTube URL</div>
          <button
            onClick={onUpload}
            className="mt-2 px-4 py-2 bg-red-500/90 hover:bg-red-400 text-white font-medium rounded"
          >
            Add Video
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-300 mx-auto"></div>
          <div className="mt-2 text-white/60">Loading videos...</div>
        </div>
      ) : (
        <MediaGrid
          data={data}
          viewMode={viewMode}
          type="video"
          onDelete={onDelete}
          onCopy={onCopy}
          onPreview={onPreview}
        />
      )}
    </div>
  );
}

function JsonTab({ data, loading, viewMode, onUpload, onDelete, onCopy, onPreview }) {
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-300" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <div className="text-lg font-semibold">Upload JSON Files</div>
          <div className="text-xs text-white/70">JSON files for configuration</div>
          <button
            onClick={onUpload}
            className="mt-2 px-4 py-2 bg-blue-500/90 hover:bg-blue-400 text-white font-medium rounded"
          >
            Upload JSON
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300 mx-auto"></div>
          <div className="mt-2 text-white/60">Loading JSON files...</div>
        </div>
      ) : (
        <MediaGrid
          data={data}
          viewMode={viewMode}
          type="json"
          onDelete={onDelete}
          onCopy={onCopy}
          onPreview={onPreview}
        />
      )}
    </div>
  );
}

// Media Grid Component
function MediaGrid({ data, viewMode, type, onDelete, onCopy, onPreview }) {
  if (data.length === 0) {
    return <div className="text-white/60 text-center py-8">No items found.</div>;
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {data.map(item => (
          <MediaListItem key={item.id} item={item} type={type} onDelete={onDelete} onCopy={onCopy} onPreview={onPreview} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {data.map(item => (
        <MediaGridItem key={item.id} item={item} type={type} onDelete={onDelete} onCopy={onCopy} onPreview={onPreview} />
      ))}
    </div>
  );
}

// Media Grid Item Component
function MediaGridItem({ item, type, onDelete, onCopy, onPreview }) {
  const getUrl = () => {
    if (type === 'video') return item.youtubeUrl;
    if (item.url) return item.url;
    if (item.file_url) return item.file_url;
    return `/uploads/${item.category}/${item.filename}`;
  };

  const getThumbnail = () => {
    if (type === 'video' && item.youtubeUrl) {
      return getYouTubeThumbnail(item.youtubeUrl);
    }
    return getUrl();
  };

  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition">
      <div className="aspect-square bg-black/40 relative">
        {type === 'video' ? (
          <img src={getThumbnail()} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-video.png'; }} />
        ) : type === 'json' ? (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-300"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
          </div>
        ) : (
          <img src={getUrl()} alt={item.title || item.filename} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/40 flex items-center justify-center gap-2">
          <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => onPreview(item)}>Preview</button>
          <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => onCopy(getUrl())}>Copy</button>
          <button className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-black font-semibold" onClick={() => onDelete(item.id, type)}>Delete</button>
        </div>
      </div>

      <div className="p-2">
        <div className="text-xs truncate font-medium" title={item.title || item.filename}>
          {item.title || item.filename}
        </div>
        <div className="text-[10px] text-white/50 mt-1">
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Media List Item Component
function MediaListItem({ item, type, onDelete, onCopy, onPreview }) {
  const getUrl = () => {
    if (type === 'video') return item.youtubeUrl;
    if (item.url) return item.url;
    if (item.file_url) return item.file_url;
    return `/uploads/${item.category}/${item.filename}`;
  };

  const getThumbnail = () => {
    if (type === 'video' && item.youtubeUrl) {
      return getYouTubeThumbnail(item.youtubeUrl);
    }
    return getUrl();
  };

  return (
    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition">
      <div className="w-16 h-16 bg-black/40 rounded-lg flex-shrink-0 mr-3 overflow-hidden">
        {type === 'video' ? (
          <img src={getThumbnail()} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-video.png'; }} />
        ) : type === 'json' ? (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-300"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
          </div>
        ) : (
          <img src={getUrl()} alt={item.title || item.filename} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
      </div>

      <div className="flex-1">
        <div className="font-medium">{item.title || item.filename}</div>
        <div className="text-sm text-white/70">{new Date(item.created_at).toLocaleDateString()}</div>
        {item.description && <div className="text-sm text-white/60 mt-1">{item.description}</div>}
      </div>

      <div className="flex gap-2">
        <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => onPreview(item)}>Preview</button>
        <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => onCopy(getUrl())}>Copy</button>
        <button className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-black font-semibold" onClick={() => onDelete(item.id, type)}>Delete</button>
      </div>
    </div>
  );
}

// Modal Components
function ImageUploadModal({ isOpen, onClose, formData, setFormData, onUpload, uploading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Storage Location</label>
            <select
              value={formData.storageType}
              onChange={(e) => setFormData(prev => ({ ...prev, storageType: e.target.value }))}
              className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
            >
              <option value="backend">Backend Uploads Folder</option>
              <option value="cloud">Cloudinary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Alt Text (Optional)</label>
            <input
              value={formData.altText}
              onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
              className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onUpload}
              disabled={uploading}
              className="flex-1 bg-yellow-500/90 text-black font-semibold py-2 px-4 rounded hover:bg-yellow-400 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoUploadModal({ isOpen, onClose, formData, setFormData, onUpload, uploading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add YouTube Video</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Title</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Video title"
              className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">YouTube URL</label>
            <input
              value={formData.youtubeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onUpload}
              disabled={uploading || !formData.title || !formData.youtubeUrl}
              className="flex-1 bg-red-500/90 text-white font-semibold py-2 px-4 rounded hover:bg-red-400 disabled:opacity-50"
            >
              {uploading ? 'Adding...' : 'Add Video'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function JsonUploadModal({ isOpen, onClose, formData, setFormData, onUpload, uploading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Upload JSON File</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Filename</label>
            <input
              value={formData.filename}
              onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
              placeholder="Enter filename (without .json)"
              className="w-full bg-neutral-700 border border-white/10 rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onUpload}
              disabled={uploading || !formData.filename}
              className="flex-1 bg-blue-500/90 text-white font-semibold py-2 px-4 rounded hover:bg-blue-400 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Modal Component
function PreviewModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Preview: {item.title || item.filename}</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            {item.type === 'video' ? (
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-white/60">Video Preview: {item.title}</div>
              </div>
            ) : item.type === 'json' ? (
              <div className="bg-neutral-900 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-sm text-white/80 whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(item.content || '{}'), null, 2)}
                </pre>
              </div>
            ) : (
              <img
                src={item.url || item.file_url || `/uploads/${item.category}/${item.filename}`}
                alt={item.title || item.filename}
                className="max-w-full max-h-96 object-contain rounded-lg"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Created:</strong> {new Date(item.created_at).toLocaleString()}
              </div>
              {item.description && (
                <div>
                  <strong>Description:</strong> {item.description}
                </div>
              )}
              {item.altText && (
                <div>
                  <strong>Alt Text:</strong> {item.altText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for YouTube thumbnails
function getYouTubeThumbnail(url) {
  try {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  } catch {
    return null;
  }
}
