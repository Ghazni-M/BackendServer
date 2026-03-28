import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // ← fixed import
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Globe,
  Settings as SettingsIcon,
  FileText,
  Users as UsersIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: 'owner' | 'admin';
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
      // Optional: toast.error('Logout failed');
    }
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Properties', path: '/admin/properties', icon: Home },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Blog', path: '/admin/blog', icon: FileText },
    { name: 'Users', path: '/admin/users', icon: UsersIcon, role: 'owner' },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.role || item.role === user?.role
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-brand-navy text-white p-4 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/admin" className="font-serif text-lg font-bold">
            Ritchie Admin
          </Link>
        </div>
        <Link
          to="/"
          className="p-2 text-gray-400 hover:text-brand-gold transition-colors"
          title="View Website"
          aria-label="View public website"
        >
          <Globe className="w-5 h-5" />
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:relative bg-brand-navy text-white transition-all duration-300 flex flex-col shadow-2xl lg:shadow-none',
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        {/* Logo / Toggle (desktop) */}
        <div className="p-6 hidden lg:flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/admin" className="font-serif text-xl font-bold text-white">
              Ritchie Admin
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="text-white hover:text-brand-gold transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow mt-4 lg:mt-6 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 transition-all duration-200',
                  isActive
                    ? 'bg-brand-gold/20 text-brand-gold font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(isSidebarOpen || window.innerWidth < 1024) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-navy font-bold text-lg flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            {(isSidebarOpen || window.innerWidth < 1024) && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || user.email || 'User'}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user.role || 'Admin'}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full text-gray-300 hover:text-white transition-colors py-2"
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(isSidebarOpen || window.innerWidth < 1024) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-auto min-w-0">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex bg-white shadow-sm px-8 py-4 items-center justify-between sticky top-0 z-30">
          <h2 className="text-xl font-serif font-bold text-brand-navy">
            {navItems.find((item) => item.path === location.pathname)?.name || 'Admin Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors flex items-center gap-2"
            >
              <Globe className="w-4 h-4" /> View Website
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};