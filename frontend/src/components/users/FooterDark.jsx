import React from 'react';
import logo from '../../assets/logo.png';

export default function FooterDark() {
  return (
    <footer className=" border-t border-yellow-500/20 relative z-10 bg-black text-yellow-100/80">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-semibold text-yellow-300">MB Pictures Canada Inc.</div>
          <p className="mt-2 text-sm text-yellow-100/70">
            Complete Movie Solution
          </p>
          <img src={logo} alt="MB Pictures Canada Inc." className="w-35 h-35" />
        </div>
        <div>
          <div className="font-medium text-yellow-300 mb-3">Explore</div>
          <nav className="flex flex-col gap-2 text-sm">
            <a href="#home" className="hover:text-yellow-300">Home</a>
            <a href="#line-production" className="hover:text-yellow-300">Projects</a>
            <a href="#services" className="hover:text-yellow-300">Services</a>
            <a href="#get-started" className="hover:text-yellow-300">Get Started</a>
          </nav>
        </div>
        <div>
          <div className="font-medium text-yellow-300 mb-3">Contact</div>
          <div className="text-sm">
            <div>125 Barker St, London, Ontario, Canada N5Y1X9</div>
            <div className="mt-1" >info@mbpicturescanada.ca</div>
            <div className="mt-1">info.mbpicturescanada@gmail.com</div>
            <div className="mt-1">mbstudiozcanada@gmail.com</div>
            <div>+1 (647) 242-6197</div>
          </div>
        </div>
      </div>
      <div className="border-t border-yellow-500/20 py-4 text-center text-xs">© {new Date().getFullYear()} MB Pictures Canada Inc.</div>
    </footer>
  );
}
