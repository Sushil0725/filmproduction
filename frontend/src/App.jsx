import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/users/Home';
import LineProductionPage from './pages/users/LineProductionPage';
import ServicesPage from './pages/users/ServicesPage';
import ProjectsPage from './pages/users/ProjectsPage';
import AboutPage from './pages/users/AboutPage';
import Login from './pages/auth/Login';
import Admin from './pages/admin/Admin';
import Playground from './pages/admin/Playground.jsx';
import History from './pages/admin/History.jsx';
import Starred from './pages/admin/Starred.jsx';
import Settings from './pages/admin/Settings.jsx';
import Models from './pages/admin/Models.jsx';
import Docs from './pages/admin/Docs.jsx';
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
        </Route>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="playground" element={<Playground />} />
            <Route path="history" element={<History />} />
            <Route path="starred" element={<Starred />} />
            <Route path="settings" element={<Settings />} />
            <Route path="models" element={<Models />} />
            <Route path="docs" element={<Docs />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
