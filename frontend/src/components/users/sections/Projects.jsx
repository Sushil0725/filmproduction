import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from '../ProjectCard';
import { projects } from '../../../data/projects';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const featured = projects.slice(0, 6);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const taglineRef = useRef(null);
  const gridRef = useRef(null);
  const cardsRef = useRef([]);
  const buttonRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation with cinematic blur
      gsap.fromTo(headerRef.current, 
        { 
          opacity: 0, 
          y: 60,
          filter: "blur(10px)"
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animated tagline with fade-in
      gsap.fromTo(taglineRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.4,
          scrollTrigger: {
            trigger: taglineRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax effect for grid container
      gsap.to(gridRef.current, {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

      // Staggered card animations with cinematic entrance
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const row = Math.floor(index / 3);
        const col = index % 3;
        const delay = 0.6 + (row * 0.2) + (col * 0.1);

        // Different entrance directions for cinematic effect
        const directions = {
          x: col === 0 ? -80 : col === 2 ? 80 : 0,
          y: 100,
          scale: 0.8,
          rotation: col === 0 ? -5 : col === 2 ? 5 : 0
        };

        gsap.fromTo(card,
          {
            opacity: 0,
            x: directions.x,
            y: directions.y,
            scale: directions.scale,
            rotation: directions.rotation,
            filter: "blur(8px)"
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            filter: "blur(0px)",
            duration: 1.4,
            delay: delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "bottom 10%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // 3D hover effects
        const hoverTL = gsap.timeline({ paused: true });
        
        hoverTL
          .to(card, {
            scale: 1.05,
            y: -15,
            z: 60,
            rotationX: -5,
            rotationY: col === 0 ? -3 : col === 2 ? 3 : 0,
            duration: 0.4,
            ease: "power2.out"
          })
          .to(card, {
            filter: "drop-shadow(0 25px 50px rgba(245, 197, 24, 0.4)) brightness(1.1)",
            duration: 0.4,
            ease: "power2.out"
          }, 0);

        card.addEventListener('mouseenter', () => hoverTL.play());
        card.addEventListener('mouseleave', () => hoverTL.reverse());
      });

      // View All button animation
      gsap.fromTo(buttonRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: 30
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
          delay: 1.4,
          scrollTrigger: {
            trigger: buttonRef.current,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse"
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="py-16 relative z-10 bg-black overflow-hidden">
      {/* Vignette overlay for cinematic depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
      </div>

      {/* Film grain texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none intro-filmgrain" />

      <div className="mx-auto max-w-7xl px-4 relative">
        <div ref={headerRef} className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Projects</h2>
            <p className="mt-2 text-yellow-100/80">Selected work across film, documentary, music, and art.</p>
          </div>
          <Link to="/projects" className="hidden sm:inline-flex items-center rounded-full bg-[#f5c518] px-5 py-2.5 text-black text-sm font-semibold hover:bg-[#ffd34d] transition-colors">
            View All
          </Link>
        </div>

        {/* Animated tagline */}
        <div ref={taglineRef} className="mt-8 text-center">
          <p className="text-lg text-yellow-200/80 font-light italic tracking-wide">
            Stories we've told. Moments we've captured.
          </p>
        </div>

        <div ref={gridRef} className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" style={{ transformStyle: "preserve-3d", perspective: "1000px" }}>
          {featured.map((p, index) => (
            <div 
              key={p.id} 
              ref={(el) => (cardsRef.current[index] = el)}
              className="will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <ProjectCard image={p.image} title={p.title} subtitle={p.subtitle} />
            </div>
          ))}
        </div>

        <div ref={buttonRef} className="mt-6 sm:hidden flex justify-center">
          <Link to="/projects" className="inline-flex items-center rounded-full bg-[#f5c518] px-6 py-3 text-black font-semibold hover:bg-[#ffd34d] transition-colors">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
