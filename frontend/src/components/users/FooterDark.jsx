import React from 'react';

export default function FooterDark() {
  return (
    <footer className=" border-t border-yellow-500/20 relative z-10 bg-black text-yellow-100/80">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-semibold text-yellow-300">MB Pictures Canada Inc.</div>
          <p className="mt-2 text-sm text-yellow-100/70">
            A film & media production house crafting cinematic stories across Canada.
          </p>
        </div>
        <div>
          <div className="font-medium text-yellow-300 mb-3">Explore</div>
          <nav className="flex flex-col gap-2 text-sm">
            <a href="#home" className="hover:text-yellow-300">Home</a>
            <a href="#line-production" className="hover:text-yellow-300">Line Production</a>
            <a href="#services" className="hover:text-yellow-300">Services</a>
            <a href="#get-started" className="hover:text-yellow-300">Get Started</a>
          </nav>
        </div>
        <div>
          <div className="font-medium text-yellow-300 mb-3">Contact</div>
          <div className="text-sm">
            <div>125 Barker St, London, Ontario, Canada</div>
            <div className="mt-1">info@mbpicturescanada.com</div>
            <div>+1 (XXX) XXX-XXXX</div>
          </div>
        </div>
      </div>
      <div className="border-t border-yellow-500/20 py-4 text-center text-xs">© {new Date().getFullYear()} MB Pictures Canada Inc.</div>
    </footer>
  );
}
