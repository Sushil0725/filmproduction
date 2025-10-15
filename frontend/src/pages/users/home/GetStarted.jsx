import React from 'react';
import high1 from '../../../assets/high1.png'; // replace with your actual asset path

export default function GetStarted() {
  return (
    <section id="get-started" className="py-20 relative z-10 bg-black scroll-mt-24">
      <div className="mx-auto flex flex-col md:flex-row items-center md:items-stretch border border-yellow-500/20">
        { /* Left */}
        <div className="w-[50%]">
          <img src={high1} alt="MB Pictures Team" className="w-[100%] h-[335px] " />
        </div>
        { /* Right */}
      <div className="w-[50%] px-40 py-10 text-center bg-yellow-500/100 justify-center flex flex-col items-center">

        <h2 className="text-3xl md:text-4xl font-bold text-black">Ready to Start Your Project?</h2>
        <p className="mt-3 text-xl text-black/80">
          Let’s bring your vision to life. Tell us about your film, documentary, music video, or art project, and our team will
          get in touch.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="mailto:info@mbpicturescanada.com" className="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-yellow font-medium hover:bg-black/80">
            Email Us
          </a>
          <a href="#contact" className="inline-flex items-center rounded-full border border-black px-5 py-2.5 text-black hover:bg-black/80 hover:text-yellow-500">
            Contact Form
          </a>
        </div>
        
      </div>
      </div>
    </section>
  );
}
