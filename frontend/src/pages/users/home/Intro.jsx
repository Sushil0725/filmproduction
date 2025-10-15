import React, { useEffect, useState } from "react";

const Intro = () => {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Always show intro on each page load; start visible immediately
    const mainTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setDone(true), 600);
    }, 4800);

    return () => {
      clearTimeout(mainTimer);
    };
  }, []);

  // Lock page scroll while intro is visible
  useEffect(() => {
    if (visible && !done) {
      try { document.body.classList.add('intro-lock'); } catch {}
    } else {
      try { document.body.classList.remove('intro-lock'); } catch {}
    }
    return () => {
      try { document.body.classList.remove('intro-lock'); } catch {}
    };
  }, [visible, done]);

  if (done) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-500`}
      aria-hidden={!visible}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black" />

      {/* Film grain overlay */}
      <div className="absolute inset-0 mix-blend-soft-light opacity-30 intro-filmgrain" />

      {/* Letterbox bars */}
      <div className="absolute left-0 right-0 top-0 h-16 bg-black" />
      <div className="absolute left-0 right-0 bottom-0 h-16 bg-black" />

      {/* Logo / Title */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-3xl md:text-5xl font-extrabold tracking-[0.2em] text-gold intro-logo">
            MB PICTURES
          </div>
          <div className="mt-4 text-sm md:text-base text-gold/80 tracking-widest intro-tagline">
            A FILM BY MB PICTURES
          </div>
        </div>
      </div>

      {/* No skip button to enforce full intro playback */}
    </div>
  );
};

export default Intro;