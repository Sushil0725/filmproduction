import React from 'react';
import { Link } from 'react-router-dom';

import high1 from '../../../assets/high1.png'; // replace with your actual asset path
import high2 from '../../../assets/high2.png'; // replace with your actual asset path

export default function RecentHighlights() {
  return (
    <section id="recent-highlights" className="py-7 relative z-10 bg-black">
      <div className="mx-auto px-20 flex flex-col md:flex-row items-center md:items-stretch gap-7">
        
        
        {/* Left*/}
        
        <div className="flex-1">
          <img src={high1} alt="MB Pictures Team" className="w-[100%] h-[335px] " />
        </div>
        {/* Right*/}
        <div className="flex-1">
            <img src={high2} alt="MB Pictures Team" className="w-[100%] h-[335px] " />
        </div>
      </div>
    </section>
  );
}
