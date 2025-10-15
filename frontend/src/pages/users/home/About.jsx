import React from 'react';
import { Link } from 'react-router-dom';

import teamImg from '../../../assets/team.png'; // replace with your actual asset path

export default function About() {
  return (
    <section id="about" className="py-20 relative z-10 bg-black">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center md:items-stretch gap-12">
        {/* Left: Image with yellow glow */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl overflow-hidden shadow-lg mx-auto mb-4" style={{ boxShadow: '0 0 32px 8px #f5c51880' }}>
              <img src={teamImg} alt="MB Pictures Team" className="w-full h-full hover:scale-120 transition-all duration-300 ease-in-out object-cover object-center" />
            </div>
            
          </div>
        </div>
        {/* Right: Heading, paragraph, button */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold mb-6 text-yellow-400">About Us</h2>
          <p className="text-lg text-yellow-50/90 mb-8 max-w-xl">
            At MB Pictures Canada Inc., we turn stories into cinematic experiences. Based in London, Ontario, we offer a full spectrum of film, media, and post-production services nationwide. Our mission is to produce films, music videos, documentaries, and art projects that inspire audiences, while supporting creators with world-class production and distribution.
          </p>
          <button onClick={() => window.location.href = '/about'} className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black w-38 font-semibold px-2 py-3 rounded-full transition shadow-lg">
          
            Read More
        
          </button>
        </div>
      </div>
    </section>
  );
}
