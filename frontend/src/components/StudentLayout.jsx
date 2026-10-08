import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Bookmark, 
  User, 
  Bell, 
  BookOpen, 
  HelpCircle, 
  Search, 
  LogOut,
  Menu,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { Button } from './ui/Button';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const primaryNavigation = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Browse Jobs', href: '/student/jobs', icon: Briefcase },
    { label: 'My Applications', href: '/student/applications', icon: FileText },
    { label: 'Saved Jobs', href: '/student/saved-jobs', icon: Bookmark },
    { label: 'Profile', href: '/student/profile', icon: User },
    { label: 'Notifications', href: '/student/notifications', icon: Bell },
  ];

  const secondaryNavigation = [];

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const [profileRes, notifsRes] = await Promise.all([
          api('/student/profile'),
          api('/student/notifications')
        ]);
        if (profileRes.success) setProfile(profileRes.profile);
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
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = ['name', 'branch', 'cgpa', 'graduationYear', 'resumeUrl', 'backlogs'];
    const completed = fields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPct = calculateCompletion();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-base overflow-y-auto">
      <div className="h-20 flex items-center px-6 shrink-0">
        <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-navy hover:opacity-80 transition-opacity">
          Career<span className="text-primary">Bridge</span>
        </Link>
      </div>

      <div className="flex-1 py-4 px-4 space-y-1">
        {primaryNavigation.map((item) => {
          const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/student' && item.href !== '/student/dashboard');
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

        <div className="my-6 border-t border-border-light mx-2" />
      </div>

      <div className="p-4 shrink-0">
        <div className="bg-surface border border-border-light rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-navy leading-tight">Complete your profile to unlock more opportunities</h4>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-navy mb-1.5">
            <span>Progress</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-base rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <Button 
            variant="outline" 
            className="w-full text-xs py-1.5 h-auto text-primary border-primary/20 hover:bg-primary/5"
            onClick={() => {
              navigate('/student/profile');
              setMobileMenuOpen(false);
            }}
          >
            Update Profile &rarr;
          </Button>
        </div>
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
            <form 
              className="hidden md:flex relative max-w-md w-full items-center"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const query = formData.get('search');
                if (query) {
                  navigate(`/student/jobs?search=${encodeURIComponent(query)}`);
                }
              }}
            >
              <Search className="w-4 h-4 text-content-muted absolute left-3" />
              <input 
                name="search"
                type="text" 
                placeholder="Search for jobs, companies or keywords..." 
                className="w-full pl-9 pr-4 py-2 bg-base border border-border-light rounded-md text-sm text-navy placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            <button 
              className="relative p-2 text-content-muted hover:text-navy hover:bg-base rounded-full transition-colors"
              onClick={() => navigate('/student/notifications')}
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
                  {profile?.name ? profile.name[0].toUpperCase() : (user?.email?.[0].toUpperCase() || 'S')}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-navy flex items-center gap-1 group-hover:text-primary transition-colors">
                    {profile?.name || user?.email?.split('@')[0] || 'Student'} 
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="text-xs text-content-muted">Student</div>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-light rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-border-light">
                    <p className="text-sm font-semibold text-navy">{profile?.name || 'Student'}</p>
                    <p className="text-xs text-content-muted truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/student/profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-base flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-content-muted" /> Profile
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
          <div className="max-w-7xl mx-auto w-full">
            <Outlet context={{ profile, unreadCount }} />
          </div>
        </main>
      </div>
    </div>
  );
}
