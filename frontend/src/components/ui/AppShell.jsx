import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({ role, navigation, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row font-sans">
      {/* Sidebar / Topnav */}
      <aside className="w-full md:w-[280px] bg-inverted text-content-inverted flex flex-col border-r border-border-dark shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-border-dark">
          <span className="text-2xl font-bold tracking-tighter">CAREERBRIDGE</span>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
          <div className="text-[10px] font-bold text-content-inverted-muted uppercase tracking-widest mb-4 px-4">
            Navigation
          </div>
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent text-inverted'
                    : 'text-content-inverted-muted hover:text-content-inverted hover:bg-inverted-surface'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-6 border-t border-border-dark bg-inverted-surface">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent text-inverted flex items-center justify-center font-bold text-lg">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.email}</p>
              <p className="text-[10px] text-content-inverted-muted uppercase tracking-widest">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-content-inverted border border-border-dark hover:bg-inverted hover:border-content-inverted transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-base relative">
        <div className="absolute inset-0 grid-lines opacity-50 pointer-events-none mix-blend-overlay"></div>

        {/* Top Header */}
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-border-light flex items-center justify-between px-8 sticky top-0 z-10 relative">
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-content-muted uppercase">
            <span>{role}</span>
            <span className="text-border-light">/</span>
            <span className="text-content">
              {navigation.find(n => location.pathname === n.href || (location.pathname.startsWith(n.href) && n.href !== `/${role.toLowerCase()}`))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-content-muted hover:text-content transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-inverted" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-auto relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
