import React, { useMemo, useState } from 'react';
import { galleryItems, mediaTypes } from '../../data/gallery';

export default function GalleryPage() {
  const [selectedType, setSelectedType] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filteredItems = useMemo(() => {
    if (selectedType === 'All') return galleryItems;
    return galleryItems.filter((item) => item.type === selectedType);
  }, [selectedType]);

  const openLightbox = (item) => {
    setLightboxItem(item);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
  };

  return (
    <div className="bg-black text-yellow-50 min-h-screen">
      
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.12),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-20 pt-24 pb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#f5c518]">Gallery</h1>
          <p className="mt-4 max-w-2xl text-yellow-100/85">
            Explore our collection of images, videos, behind-the-scenes moments, and event coverage.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-20">
          
          <div className="flex flex-wrap gap-3 mb-10">
            {mediaTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedType === type
                    ? 'bg-[#f5c518] text-black'
                    : 'bg-zinc-900 text-yellow-100/80 hover:bg-zinc-800 border border-yellow-500/30'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => openLightbox(item)}
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-900">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-[#f5c518] flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8 text-black ml-1"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-yellow-300">{item.title}</h3>
                  <p className="text-yellow-100/70 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-yellow-100/60 text-lg">No media found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center text-yellow-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.mediaType === 'video' ? (
              <div className="w-full aspect-video">
                <iframe
                  src={lightboxItem.videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <img
                src={lightboxItem.thumbnail}
                alt={lightboxItem.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-yellow-300">{lightboxItem.title}</h3>
              <p className="text-yellow-100/80 mt-2">{lightboxItem.description}</p>
            </div>
          </div>
        </div>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Want to see more?</h2>
          <p className="mt-3 text-yellow-100/80 max-w-2xl mx-auto">
            Follow us on social media for daily updates and exclusive behind-the-scenes content.
          </p>
          <div className="mt-6">
            <a
              href="mailto:info@mbpicturescanada.com"
              className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
