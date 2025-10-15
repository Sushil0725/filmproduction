import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/users/Header';
import FooterDark from '../../components/users/FooterDark';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <FooterDark />
    </div>
  );
}
