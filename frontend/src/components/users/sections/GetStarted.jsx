import React from 'react';

export default function GetStarted() {
  return (
    <section id="get-started" className="py-20 relative z-10 bg-black scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Ready to Start Your Project?</h2>
        <p className="mt-3 text-yellow-100/80">
          Let’s bring your vision to life. Tell us about your film, documentary, music video, or art project, and our team will
          get in touch.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-yellow-400 px-5 py-2.5 text-black font-medium hover:bg-yellow-300">
            Email Us
          </a>
          <a href="#contact" className="inline-flex items-center rounded-full border border-yellow-500/50 px-5 py-2.5 text-yellow-100 hover:bg-yellow-500/10">
            Contact Form
          </a>
        </div>
      </div>
    </section>
  );
}
