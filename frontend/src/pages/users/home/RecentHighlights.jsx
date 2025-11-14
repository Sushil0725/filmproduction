import React from 'react';
import { Link } from 'react-router-dom';

import high1 from '../../../assets/high1.png'; // replace with your actual asset path
import high2 from '../../../assets/high2.png'; // replace with your actual asset path

export default function RecentHighlights() {
  return (
    <section id="recent-highlights" className="py-7 relative z-10 bg-black">
      <div className="mx-auto px-6 md:px-20 flex flex-col md:flex-row items-center md:items-stretch gap-7">
        
        
        {/* Left*/}
        
        <div className="flex-1 relative group overflow-hidden">
          <img src={high1} alt="MB Pictures Team" className="w-full h-[335px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h3 className="text-3xl font-bold mb-2 uppercase tracking-wide">I KNOW WHAT YOU DID LAST SUMMER</h3>
            <p className="text-lg font-medium">Now on Digital</p>
          </div>
        </div>
        {/* Right*/}
        <div className="flex-1 relative group overflow-hidden">
            <img src={high2} alt="MB Pictures Team" className="w-full h-[335px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-3xl font-bold mb-2 uppercase tracking-wide">FEATURED PRODUCTION</h3>
              <p className="text-lg font-medium">Coming Soon</p>
            </div>
        </div>
      </div>
    </section>
  );
}
