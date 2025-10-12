import React from 'react';
import { Outlet } from 'react-router-dom';
import PillNavbar from '../../components/users/PillNavbar';
import FooterDark from '../../components/users/FooterDark';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PillNavbar />
      <main>
        <Outlet />
      </main>
      <FooterDark />
    </div>
  );
}
