import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/users/Home';
import Login from './pages/auth/Login';
import Admin from './pages/admin/Admin';
import NotFound from './NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <Link className="font-semibold" to="/">FilmPro</Link>
        <Link className="text-sm text-gray-600" to="/">Home</Link>
        <Link className="text-sm text-gray-600" to="/admin">Admin</Link>
      </div>
      <div>
        {isAuthenticated ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-700">{user?.username || 'admin'}</span>
            <button className="px-3 py-1 border rounded" onClick={logout}>Logout</button>
          </div>
        ) : (
          <Link className="px-3 py-1 border rounded" to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
