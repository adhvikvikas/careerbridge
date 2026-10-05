import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({ role, navigation, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentNav = navigation.find(n => location.pathname === n.href || (location.pathname.startsWith(n.href) && n.href !== `/${role.toLowerCase()}`))?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border-light bg-surface shrink-0">
        <span className="text-xl font-bold tracking-tight text-content">CareerBridge</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 bg-surface">
        <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4 px-2">
          Navigation
        </div>
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-content-muted hover:bg-base hover:text-content'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border-light bg-surface shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-content">{user?.email}</p>
            <p className="text-xs text-content-muted capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-content border border-border-light rounded-md hover:bg-base transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-base flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-border-light bg-surface shrink-0 fixed inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-inverted/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-surface transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-border-light flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-content-muted hover:text-content rounded-md hover:bg-base"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-content-muted capitalize">
              <span className="hidden sm:inline">{role}</span>
              <span className="hidden sm:inline text-border-light">/</span>
              <span className="text-content font-semibold">{currentNav}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-content-muted hover:text-content hover:bg-base rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {/* Note: this red dot is just a UI placeholder for Phase 2, real integration comes later */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
