// import React, { useRef } from 'react';
// import { Link } from 'react-router-dom';
// import ServiceCard from '../../users/ServiceCard';
// import nisi from '../../../assets/services/916.jpg';

// export default function Services() {
//   const items = [
//     {
//       title: 'Film Production',
//       description: 'Feature films, shorts, and artistic projects with cinematic excellence.',
//       image: nisi,
//     },
//     {
//       title: 'Documentaries',
//       description: 'Real stories crafted with depth, authenticity, and vision.',
//       image: nisi,
//     },
//     {
//       title: 'Music Videos',
//       description: 'Bold, visually striking productions for artists and labels.',
//       image: nisi,
//     },
//     {
//       title: 'Post-Production',
//       description: 'Editing, color grading, VFX, and sound to perfection.',
//       image: nisi,
//     },
//     {
//       title: 'Casting',
//       description: 'Connecting your projects with the right talent across Canada.',
//       image: nisi,
//     },
//     {
//       title: 'Distribution',
//       description: 'Delivering projects to audiences worldwide across platforms.',
//       image: nisi,
//     },
//   ];
//   const maskStyle = {
//     maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
//     WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
//   };

//   // Drag-to-scroll support on desktop
//   const wrapRef = useRef(null);
//   const trackRef = useRef(null);
//   const dragState = useRef({ down: false, startX: 0, scrollLeft: 0, pid: 0 });

//   function onPointerDown(e) {
//     const el = wrapRef.current;
//     if (!el) return;
//     dragState.current = { down: true, startX: e.clientX, scrollLeft: el.scrollLeft, pid: e.pointerId };
//     try { el.setPointerCapture(e.pointerId); } catch {}
//   }
//   function onPointerMove(e) {
//     const el = wrapRef.current;
//     const st = dragState.current;
//     if (!el || !st.down) return;
//     const dx = e.clientX - st.startX;
//     el.scrollLeft = st.scrollLeft - dx;
//   }
//   function onPointerUp(e) {
//     const el = wrapRef.current;
//     const st = dragState.current;
//     st.down = false;
//     try { el?.releasePointerCapture?.(st.pid); } catch {}
//   }

//   function getStep() {
//     const el = wrapRef.current;
//     const track = trackRef.current;
//     if (!el || !track) return 0;
//     const first = track.querySelector('.service-card');
//     const gap = parseFloat(getComputedStyle(track).gap || '0');
//     const w = first ? first.getBoundingClientRect().width : 0;
//     return Math.max(0, Math.round(w + gap));
//   }
//   function scrollByCards(dir = 1) {
//     const el = wrapRef.current; if (!el) return;
//     const step = getStep();
//     el.scrollBy({ left: dir * step, behavior: 'smooth' });
//   }
//   function onKeyDown(e) {
//     if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCards(1); }
//     if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCards(-1); }
//   }

//   return (
//     <section id="services" className="py-16 relative z-10 bg-black">
//       <div className="mx-auto max-w-7xl px-4">
//         <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Our Services</h2>
//         <p className="mt-2 text-yellow-100/80">Comprehensive production services from concept to distribution.</p>
//         <div className="mt-8 group relative">
//           {/* Scroll wrapper */}
//           <div
//             ref={wrapRef}
//             className="overflow-x-auto overflow-y-visible no-scrollbar select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory"
//             style={{ ...maskStyle, touchAction: 'pan-y', scrollBehavior: 'smooth' }}
//             onPointerDown={onPointerDown}
//             onPointerMove={onPointerMove}
//             onPointerUp={onPointerUp}
//             onPointerLeave={onPointerUp}
//             onKeyDown={onKeyDown}
//             tabIndex={0}
//             aria-label="Our services carousel"
//           >
//             {/* Track */}
//             <div
//               ref={trackRef}
//               className="flex gap-6 animate-marquee"
//               style={{ width: 'max-content', animationDuration: '40s' }}
//             >
//               {[...items, ...items].map((it, idx) => (
//                 <div key={`${it.title}-${idx}`} aria-hidden={idx >= items.length} className="flex-shrink-0 snap-start">
//                   <ServiceCard
//                     image={it.image}
//                     title={it.title}
//                     description={it.description}
//                     className="w-40 sm:w-48 md:w-56 lg:w-64"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Arrows */}
//           <button
//             type="button"
//             className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-yellow-500/30 text-yellow-200 hover:bg-black/70"
//             onClick={() => scrollByCards(-1)}
//             aria-label="Scroll left"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
//               <path d="M15.75 19.5 8.25 12l7.5-7.5" />
//             </svg>
//           </button>
//           <button
//             type="button"
//             className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-yellow-500/30 text-yellow-200 hover:bg-black/70"
//             onClick={() => scrollByCards(1)}
//             aria-label="Scroll right"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
//               <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
//             </svg>
//           </button>
        
//           {/* View More CTA */}
//           <div className="mt-6 flex justify-center">
//             <Link to="/services" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d]">
//               View More
//             </Link>
//           </div>
          
//         </div>
//       </div>
//     </section>
//   );
// }


import React, { useRef, useState, useEffect } from "react";

// Services data
const fallbackServicesData = [
  "Film Production",
  "Documentaries",
  "Music Videos",
  "Post-Production",
  "Casting",
  "Distribution",
  "Daily Programs",
  "Line Producing",
  "Commercial Production"
];

// Sample images for services - replace with your actual images
const serviceImages = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80", // Feature Films
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80", // Shorts
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80", // Music Videos
  "https://images.unsplash.com/photo-1493804714600-6edb1cd93080?auto=format&fit=crop&w=800&q=80", // Documentaries
  "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=800&q=80", // Post-Production
  "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=800&q=80", // Casting
  "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?auto=format&fit=crop&w=800&q=80", // Daily Programs
  "https://images.unsplash.com/photo-1523207911345-32501502db22?auto=format&fit=crop&w=800&q=80", // Line Producing
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80", // Distribution
];

const Services = () => {
  const [items, setItems] = useState(fallbackServicesData);
  const [images, setImages] = useState(serviceImages);
  useEffect(() => {
    fetch('/api/public/services')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          const titles = data.map((d) => d.title);
          const imgs = data.map((d, i) => d.image_url || serviceImages[i % serviceImages.length]);
          setItems(titles);
          setImages(imgs);
        }
      })
      .catch(() => {});
  }, []);
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (autoplayPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [items.length, autoplayPaused]);

  // Handle mouse events for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    setAutoplayPaused(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged far enough, change slide
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        // Dragged right - go to previous slide (with infinite loop)
        setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
      } else if (dragOffset < 0) {
        // Dragged left - go to next slide (with infinite loop)
        setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
      }
    }
    
    setDragOffset(0);
    
    // Resume autoplay after 3 seconds
    setTimeout(() => {
      setAutoplayPaused(false);
    }, 3000);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
    setAutoplayPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  // Get visible slides (previous, current, next) with infinite wrapping
  const getVisibleSlides = () => {
    const slides = [];
    
    // Always show 3 slides with wrapping for infinite carousel
    if (items.length > 0) {
      // Previous slide (with wrapping)
      const prevIndex = (activeIndex - 1 + items.length) % items.length;
      slides.push({
        index: prevIndex,
        position: 'left',
        service: items[prevIndex],
        image: images[prevIndex % images.length]
      });
      
      // Current slide
      slides.push({
        index: activeIndex,
        position: 'center',
        service: items[activeIndex],
        image: images[activeIndex % images.length]
      });
      
      // Next slide (with wrapping)
      const nextIndex = (activeIndex + 1) % items.length;
      slides.push({
        index: nextIndex,
        position: 'right',
        service: items[nextIndex],
        image: images[nextIndex % images.length]
      });
    }
    
    return slides;
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setActiveIndex(index);
    setAutoplayPaused(true);
    
    // Resume autoplay after 3 seconds
    setTimeout(() => {
      setAutoplayPaused(false);
    }, 3000);
  };

  return (
    <section
      id="services"
      className="py-20 bg-black z-10 relative text-[#f5c518] overflow-hidden"
    >
      <h2 className="text-4xl font-bold text-center mb-10 text-[#f5c518]">Our Services</h2>
      
      <div 
        ref={carouselRef}
        className="relative h-[70vh] mx-auto overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${dragOffset}px)` }}
        >
          {getVisibleSlides().map((slide) => (
            <div
              key={slide.index}
              className={`absolute transition-all duration-500 ease-out ${
                slide.position === 'center' 
                  ? 'z-20 scale-100 opacity-100' 
                  : slide.position === 'left'
                    ? 'z-10 -translate-x-[calc(100%-6rem)] scale-75 opacity-50'
                    : 'z-10 translate-x-[calc(100%-6rem)] scale-75 opacity-50'
              }`}
            >
              <div className="relative overflow-hidden rounded-lg shadow-2xl group" style={{ width: '80vw', maxWidth: '1000px', height: '60vh' }}>
                <img 
                  src={slide.image} 
                  alt={slide.service}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-4xl font-bold mb-2 text-white">{slide.service}</h3>
                  <p className="text-xl text-[#f5c518]/80 max-w-xl mb-6">
                    Professional {slide.service.toLowerCase()} services tailored to your creative vision.
                  </p>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      data-cursor="view"
                      className="flex items-center justify-center w-14 h-14 rounded-full border border-white hover:border-[#f5c518] transition-all duration-300 scale-100 hover:scale-105"
                      onClick={() => {}}
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="w-0 h-0 ml-1 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent hover:border-l-[#f5c518] transition-colors duration-300"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-8 gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex ? 'bg-[#f5c518] w-6' : 'bg-[#f5c518]/40'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Services;
