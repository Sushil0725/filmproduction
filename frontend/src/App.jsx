import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/users/Home';
import LineProductionPage from './pages/users/LineProductionPage';
import ServicesPage from './pages/users/ServicesPage';
import ProjectsPage from './pages/users/ProjectsPage';
import GalleryPage from './pages/users/GalleryPage';
import AboutPage from './pages/users/AboutPage';
import Login from './pages/auth/Login';
import Admin from './pages/admin/Admin';
import Settings from './pages/admin/Settings.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import MediaControl from './pages/admin/MediaControl.jsx';
import HeroManager from './pages/admin/HeroManager.jsx';
import ServicesManager from './pages/admin/ServicesManager.jsx';
import ProjectsManager from './pages/admin/ProjectsManager.jsx';
import GalleryManager from './pages/admin/GalleryManager.jsx';
import NewsManager from './pages/admin/NewsManager.jsx';
import NotFound from './NotFound';
import ProtectedRoute from './common/ProtectedRoute';
import UserLayout from './layouts/users/UserLayout';
import AdminLayout from './layouts/admin/AdminLayout.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="line-production" element={<LineProductionPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mediactrl" element={<MediaControl />} />
            <Route path="heromng" element={<HeroManager />} />
            <Route path="servicemng" element={<ServicesManager />} />
            <Route path="projectmng" element={<ProjectsManager />} />
            <Route path="gallerymng" element={<GalleryManager />} />
            <Route path="newsmng" element={<NewsManager />} />
            <Route path="setting" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
