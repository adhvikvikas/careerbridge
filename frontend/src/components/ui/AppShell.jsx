import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Menu, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({ role, navigation, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentNav = navigation.find(n => location.pathname === n.href || (location.pathname.startsWith(n.href) && n.href !== `/${role.toLowerCase()}`))?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-6 shrink-0">
        <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-navy hover:opacity-80 transition-opacity">
          Career<span className="text-primary">Bridge</span>
        </Link>
      </div>

      <div className="flex-1 py-4 px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-content-muted hover:bg-surface hover:text-navy'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex font-sans text-content">
      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex w-[280px] flex-col border-r border-border-light bg-base shrink-0 fixed inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-base transform transition-transform duration-300 xl:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 xl:pl-[280px] bg-surface">
        {/* Top Header */}
        <header className="h-20 bg-surface border-b border-border-light flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="xl:hidden p-2 -ml-2 text-content-muted hover:text-navy rounded-md hover:bg-base"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-content-muted capitalize">
              <span className="hidden sm:inline">{role}</span>
              <span className="hidden sm:inline text-border-light">/</span>
              <span className="text-navy font-semibold">{currentNav}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            <div className="relative">
              <button 
                className="flex items-center gap-3 pl-4 border-l border-border-light cursor-pointer group rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 bg-navy text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {user?.email?.[0].toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-navy flex items-center gap-1 group-hover:text-primary transition-colors">
                    {role.toLowerCase()} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="text-xs text-content-muted">{role}</div>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-light rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-border-light">
                      <p className="text-sm font-semibold text-navy">{role}</p>
                      <p className="text-xs text-content-muted truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto w-full p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
