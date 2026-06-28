import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      try {
        await axios.get('http://localhost:5000/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // Token invalid or expired — kick them out
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [navigate]);

  // Close sidebar whenever route changes (on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'People Manager', path: '/admin/people', icon: <Users size={20} /> },
    { name: 'Global Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/40 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold text-lg">M</span>
          </div>
          <span className="font-semibold text-lg tracking-wide">CMS Admin</span>
        </div>
        {/* Close button only visible on mobile */}
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname.startsWith(item.path)
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-white font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl flex-col p-6 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-[#0d0d0d] border-r border-white/10 flex flex-col p-6 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
              <span className="font-bold text-sm">M</span>
            </div>
            <span className="font-semibold">CMS Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
