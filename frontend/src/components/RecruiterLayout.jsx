import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  Building2, 
  BriefcaseBusiness, 
  Users, 
  Bell, 
  User,
  Search,
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/Button';

export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Global Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ jobs: [], applications: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const primaryNavigation = [
    { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Company', href: '/recruiter/company', icon: Building2 },
    { label: 'Jobs', href: '/recruiter/jobs', icon: BriefcaseBusiness },
    { label: 'Profile', href: '/recruiter/profile', icon: User },
    { label: 'Notifications', href: '/recruiter/notifications', icon: Bell },
  ];

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const notifsRes = await api('/recruiter/notifications');
        if (notifsRes.success) {
          setUnreadCount(notifsRes.notifications.filter(n => !n.readAt).length);
        }
      } catch (err) {
        console.error('Failed to fetch shared layout data', err);
      }
    };
    fetchSharedData();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ jobs: [], applications: [] });
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/recruiter/jobs'),
          api.get('/recruiter/applications')
        ]);
        
        const q = searchQuery.toLowerCase();
        
        const filteredJobs = (jobsRes.data.jobs || []).filter(job => 
          job.title.toLowerCase().includes(q) || 
          job.description.toLowerCase().includes(q)
        ).slice(0, 5);
        
        const filteredApps = (appsRes.data.applications || []).filter(app => 
          app.student.user.email.toLowerCase().includes(q) ||
          app.job.title.toLowerCase().includes(q)
        ).slice(0, 5);

        setSearchResults({ jobs: filteredJobs, applications: filteredApps });
        setSearchOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-base overflow-y-auto">
      <div className="h-20 flex items-center px-6 shrink-0">
        <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-navy hover:opacity-80 transition-opacity">
          Career<span className="text-primary">Bridge</span>
        </Link>
      </div>

      <div className="flex-1 py-4 px-4 space-y-1">
        {primaryNavigation.map((item) => {
          const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/recruiter' && item.href !== '/recruiter/dashboard');
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-content-muted hover:bg-surface hover:text-navy'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className={`ml-auto w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-primary'}`} />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
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

            {/* Global Search */}
            <div className="hidden md:flex relative max-w-md w-full items-center" ref={searchRef}>
              <Search className="w-4 h-4 text-content-muted absolute left-3" />
              <input 
                type="text" 
                placeholder="Search by jobs, applicants, or keywords..." 
                className="w-full pl-9 pr-4 py-2 bg-base border border-border-light rounded-md text-sm text-navy placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchOpen(true);
                }}
              />
              
              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-light rounded-lg shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-content-muted">Searching...</div>
                  ) : searchResults.jobs.length === 0 && searchResults.applications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-content-muted">No results found</div>
                  ) : (
                    <div className="py-2">
                      {searchResults.jobs.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-content-muted bg-base">Jobs</div>
                          {searchResults.jobs.map(job => (
                            <Link 
                              key={job.id} 
                              to={`/recruiter/jobs/${job.id}`}
                              className="block px-4 py-2 hover:bg-base text-sm transition-colors"
                              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                            >
                              <div className="font-semibold text-navy truncate">{job.title}</div>
                              <div className="text-xs text-content-muted truncate">{job.status}</div>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.applications.length > 0 && (
                        <div>
                          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-content-muted bg-base">Applications</div>
                          {searchResults.applications.map(app => (
                            <Link 
                              key={app.id} 
                              to={`/recruiter/applications/${app.id}`}
                              className="block px-4 py-2 hover:bg-base text-sm transition-colors"
                              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                            >
                              <div className="font-semibold text-navy truncate">{app.student.user.email}</div>
                              <div className="text-xs text-content-muted truncate">{app.job.title} • {app.status}</div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            <button 
              className="relative p-2 text-content-muted hover:text-navy hover:bg-base rounded-full transition-colors"
              onClick={() => navigate('/recruiter/notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
              )}
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center gap-3 pl-4 border-l border-border-light cursor-pointer group rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 bg-navy text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {user?.email?.[0].toUpperCase() || 'R'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-navy flex items-center gap-1 group-hover:text-primary transition-colors">
                    recruiter <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="text-xs text-content-muted">Recruiter</div>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-light rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-border-light">
                    <p className="text-sm font-semibold text-navy">Recruiter</p>
                    <p className="text-xs text-content-muted truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/recruiter/profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-base flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-content-muted" /> Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/recruiter/company');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-base flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-content-muted" /> Company
                    </button>
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
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto w-full p-6 lg:p-8">
            <Outlet context={{ unreadCount }} />
          </div>
        </main>
      </div>
    </div>
  );
}
