import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MediaControl() {
  const { authFetch, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'videos'
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [imagePage, setImagePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [imageTotalPages, setImageTotalPages] = useState(1);
  const [videoTotalPages, setVideoTotalPages] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [showYouTubeForm, setShowYouTubeForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const itemsPerPage = 20;

  // Fetch images from API
  const fetchImages = async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: itemsPerPage.toString(),
        filetype: 'image'
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await authFetch(`/api/admin/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.data.media || []);
        setImageTotalPages(data.data.pagination?.totalPages || 1);
        setImagePage(pageNum);
      } else {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        
        let errorMessage = 'Failed to load images';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Failed to load images: ${response.status} ${response.statusText}`;
        }
        setMessage(errorMessage);
        console.error('Failed to load images:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setMessage(`Error loading images: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos from API
  const fetchVideos = async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: itemsPerPage.toString(),
        filetype: 'video'
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await authFetch(`/api/admin/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.data.media || []);
        setVideoTotalPages(data.data.pagination?.totalPages || 1);
        setVideoPage(pageNum);
      } else {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        
        let errorMessage = 'Failed to load videos';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Failed to load videos: ${response.status} ${response.statusText}`;
        }
        setMessage(errorMessage);
        console.error('Failed to load videos:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setMessage(`Error loading videos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch media based on active tab
  useEffect(() => {
    if (activeTab === 'images') {
      fetchImages(1, search);
    } else {
      fetchVideos(1, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, search]);

  // Handle file upload
  const handleUpload = async (files, fileType) => {
    if (!files || files.length === 0) return;

    // Filter files by type
    const filteredFiles = Array.from(files).filter(file => {
      if (fileType === 'image') {
        return file.type.startsWith('image/');
      } else if (fileType === 'video') {
        return file.type.startsWith('video/');
      }
      return false;
    });

    if (filteredFiles.length === 0) {
      setMessage(`Please select ${fileType} files only`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      filteredFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await authFetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Successfully uploaded ${data.data.files.length} ${fileType}(s)`);
        
        // Refresh the appropriate list
        if (fileType === 'image') {
          fetchImages(imagePage, search);
        } else {
          fetchVideos(videoPage, search);
        }
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleImageFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files, 'image');
    }
  };

  const handleVideoFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files, 'video');
    }
  };

  // Handle YouTube video upload
  const handleYouTubeUpload = async () => {
    if (!youtubeUrl.trim()) {
      setMessage('Please enter a YouTube URL');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const response = await authFetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          title: youtubeTitle.trim() || 'YouTube Video'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'YouTube video added successfully');
        setYoutubeUrl('');
        setYoutubeTitle('');
        setShowYouTubeForm(false);
        fetchVideos(videoPage, search);
        setTimeout(() => setMessage(''), 3000);
      } else {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        
        let errorMessage = 'Failed to add YouTube video';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Failed to add YouTube video: ${response.status} ${response.statusText}`;
        }
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('YouTube upload error:', error);
      setMessage('Failed to add YouTube video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Determine file type from first file
      const firstFile = files[0];
      if (firstFile.type.startsWith('image/')) {
        handleUpload(files, 'image');
      } else if (firstFile.type.startsWith('video/')) {
        handleUpload(files, 'video');
      } else {
        setMessage('Please drop image or video files only');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id, filetype) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/admin/media/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Media deleted successfully');
        
        // Refresh the appropriate list
        if (filetype === 'image') {
          fetchImages(imagePage, search);
        } else {
          fetchVideos(videoPage, search);
        }
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        
        setMessage('Failed to delete media');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete media');
    }
  };

  // Copy URL to clipboard
  const copyUrl = (url) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setMessage('URL copied to clipboard');
      setTimeout(() => setMessage(''), 2000);
    });
  };

  // Get file URL
  const getFileUrl = (item) => {
    return item.fileurl || '';
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Get YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get current media list and pagination
  const currentMedia = activeTab === 'images' ? images : videos;
  const currentPage = activeTab === 'images' ? imagePage : videoPage;
  const currentTotalPages = activeTab === 'images' ? imageTotalPages : videoTotalPages;

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Media Control</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => {
            setActiveTab('images');
            setSearch('');
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'images'
              ? 'border-b-2 border-yellow-500 text-yellow-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Images
        </button>
        <button
          onClick={() => {
            setActiveTab('videos');
            setSearch('');
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'videos'
              ? 'border-b-2 border-yellow-500 text-yellow-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Videos
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`rounded-2xl border-2 ${
          dragOver
            ? 'border-yellow-400 bg-white/10'
            : 'border-dashed border-white/20 bg-white/5'
        } p-8 text-center transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            {activeTab === 'images' ? (
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-yellow-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-yellow-400"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Drag & Drop {activeTab === 'images' ? 'Images' : 'Videos'} Here
            </h3>
            <p className="text-sm text-white/70 mb-4">
              or click the button below to select {activeTab}
            </p>
          </div>
          <div className="flex gap-3">
            <label className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 px-6 py-3 text-black font-semibold cursor-pointer transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Select {activeTab === 'images' ? 'Images' : 'Videos'}
              </span>
              <input
                ref={activeTab === 'images' ? imageInputRef : videoInputRef}
                type="file"
                multiple
                accept={activeTab === 'images' ? 'image/*' : 'video/*'}
                className="hidden"
                onChange={activeTab === 'images' ? handleImageFileChange : handleVideoFileChange}
                disabled={uploading}
              />
            </label>
            {activeTab === 'videos' && (
              <button
                onClick={() => setShowYouTubeForm(!showYouTubeForm)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-400 px-6 py-3 text-white font-semibold transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Add YouTube Video
              </button>
            )}
          </div>
          {activeTab === 'videos' && showYouTubeForm && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 w-full max-w-md mx-auto">
              <h4 className="text-lg font-semibold mb-3">Add YouTube Video</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-neutral-800/70 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="Video Title"
                    className="w-full bg-neutral-800/70 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleYouTubeUpload}
                    disabled={uploading || !youtubeUrl.trim()}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Video
                  </button>
                  <button
                    onClick={() => {
                      setShowYouTubeForm(false);
                      setYoutubeUrl('');
                      setYoutubeTitle('');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {uploading && (
            <div className="text-yellow-400 font-medium">Uploading...</div>
          )}
          {message && !uploading && (
            <div
              className={`font-medium ${
                message.includes('Failed') || message.includes('Error')
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder={`Search ${activeTab} by filename...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-neutral-800/70 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12 text-white/60">Loading {activeTab}...</div>
      ) : currentMedia.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          No {activeTab} found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentMedia.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-colors"
              >
                <div className="aspect-square bg-black/40 relative overflow-hidden">
                  {item.filetype === 'image' ? (
                    <img
                      src={getFileUrl(item)}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : item.filetype === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/60 relative">
                      {isYouTubeUrl(getFileUrl(item)) ? (
                        <>
                          <img
                            src={getYouTubeThumbnail(getFileUrl(item)) || ''}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors pointer-events-none">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-16 h-16 text-red-600"
                              fill="currentColor"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <>
                          <video
                            src={getFileUrl(item)}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                            onMouseEnter={(e) => {
                              e.target.play().catch(() => {});
                            }}
                            onMouseLeave={(e) => {
                              e.target.pause();
                              e.target.currentTime = 0;
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors pointer-events-none">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-16 h-16 text-white/70"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/60">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-12 h-12 text-white/50"
                        fill="currentColor"
                      >
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyUrl(getFileUrl(item))}
                      className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
                      title="Copy URL"
                    >
                      Copy
                    </button>
                    <a
                      href={getFileUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
                      title="Open in new tab"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => handleDelete(item.id, item.filetype)}
                      className="px-3 py-1.5 rounded bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs truncate mb-1" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-white/50 capitalize mb-1">
                    {item.filetype}
                  </p>
                  <p className="text-[10px] text-white/50">
                    {formatDate(item.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {currentTotalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  if (activeTab === 'images') {
                    fetchImages(currentPage - 1, search);
                  } else {
                    fetchVideos(currentPage - 1, search);
                  }
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-white/70">
                Page {currentPage} of {currentTotalPages}
              </span>
              <button
                onClick={() => {
                  if (activeTab === 'images') {
                    fetchImages(currentPage + 1, search);
                  } else {
                    fetchVideos(currentPage + 1, search);
                  }
                }}
                disabled={currentPage === currentTotalPages}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
