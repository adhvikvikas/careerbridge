import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

import RecruiterLayout from './components/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import RecruiterCompany from './pages/recruiter/RecruiterCompany';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterJobForm from './pages/recruiter/RecruiterJobForm';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import RecruiterApplicationDetails from './pages/recruiter/RecruiterApplicationDetails';
import RecruiterNotifications from './pages/recruiter/RecruiterNotifications';

import StudentLayout from './components/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobs from './pages/student/StudentJobs';
import StudentJobDetails from './pages/student/StudentJobDetails';
import StudentApplications from './pages/student/StudentApplications';
import StudentApplicationDetails from './pages/student/StudentApplicationDetails';
import StudentSavedJobs from './pages/student/StudentSavedJobs';
import StudentNotifications from './pages/student/StudentNotifications';

import { ArrowRight, Box, CheckSquare, BarChart, Network, Lock, Zap } from 'lucide-react';
import { Button } from './components/ui/Button';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-base text-content font-sans">
      {/* Navigation */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-border-light bg-surface sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight text-content">CareerBridge</div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-content-muted">
          <a href="#product" className="hover:text-primary transition-colors">Platform</a>
          <a href="#roles" className="hover:text-primary transition-colors">Solutions</a>
          <a href="#process" className="hover:text-primary transition-colors">Process</a>
        </nav>
        <div>
          {user ? (
            <Button variant="primary" onClick={() => window.location.href=`/${user.role.toLowerCase()}/dashboard`}>
              Enter Portal
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.location.href='/login'}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* SECTION 1 - HERO */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Platform Live for 2026 Placements
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-content leading-tight">
              Institutional Recruitment, <br className="hidden md:block"/>
              <span className="text-primary">Perfected.</span>
            </h1>

            <p className="text-lg md:text-xl text-content-muted font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
              CareerBridge connects ambitious students, leading employers, and placement teams through one intelligent, streamlined platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button variant="primary" size="lg" className="px-8" onClick={() => window.location.href=`/${user.role.toLowerCase()}/dashboard`}>
                  Enter Portal <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button variant="primary" size="lg" className="px-8" onClick={() => window.location.href='/login'}>
                    Sign In
                  </Button>
                  <Button variant="outline" size="lg" className="px-8" onClick={() => window.location.href='/login'}>
                    Explore Roles
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2 - THREE ROLES */}
        <section id="roles" className="py-24 px-6 md:px-12 bg-surface border-y border-border-light">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">One unified platform.</h2>
              <p className="text-content-muted text-lg">Tailored experiences for every step of the placement journey.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Student */}
              <div className="p-8 rounded-2xl bg-base border border-border-light hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Network className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Students</h3>
                <p className="text-content-muted mb-8 leading-relaxed">
                  Discover opportunities that match your profile. Track your applications and eligibility criteria with precision.
                </p>
                <Button variant="outline" className="w-full">Student Portal</Button>
              </div>

              {/* Recruiter */}
              <div className="p-8 rounded-2xl bg-base border border-border-light hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <BarChart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Recruiters</h3>
                <p className="text-content-muted mb-8 leading-relaxed">
                  Manage job postings, applicant pipelines, and recruitment workflows from a unified command center.
                </p>
                <Button variant="outline" className="w-full">Recruiter Portal</Button>
              </div>

              {/* Admin */}
              <div className="p-8 rounded-2xl bg-base border border-border-light hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Administrators</h3>
                <p className="text-content-muted mb-8 leading-relaxed">
                  Control approvals, enforce governance, and maintain institutional workflows with immutable audit logs.
                </p>
                <Button variant="outline" className="w-full">Admin Portal</Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - CAPABILITIES */}
        <section id="product" className="py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-center">Platform Capabilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <Box />, title: 'Smart Discovery', desc: 'Matched opportunities' },
                { icon: <CheckSquare />, title: 'Eligibility', desc: 'Automated verification' },
                { icon: <BarChart />, title: 'Tracking', desc: 'Real-time status' },
                { icon: <Lock />, title: 'Security', desc: 'Role-based access' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6">
                  <div className="w-14 h-14 bg-surface border border-border-light text-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    {feature.icon}
                  </div>
                  <h4 className="text-sm font-bold mb-1">{feature.title}</h4>
                  <p className="text-xs text-content-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 - FINAL CTA */}
        <section className="py-24 px-6 md:px-12 bg-primary text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              Ready to begin?
            </h2>
            <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
              Join the institutional platform powering the next generation of recruitment.
            </p>
            <Button variant="secondary" size="lg" className="px-8 text-primary font-bold" onClick={() => window.location.href='/login'}>
              Sign In to CareerBridge
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t border-border-light bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-bold tracking-tight text-content">CareerBridge</div>
          <div className="flex gap-6 text-sm text-content-muted font-medium">
            <a href="#" className="hover:text-primary transition-colors">Students</a>
            <a href="#" className="hover:text-primary transition-colors">Recruiters</a>
            <a href="#" className="hover:text-primary transition-colors">Administration</a>
          </div>
          <div className="text-xs text-content-muted">
            &copy; 2026 CareerBridge Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<ProtectedRoute allowedRole="RECRUITER"><RecruiterLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="company" element={<RecruiterCompany />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<RecruiterJobForm />} />
            <Route path="jobs/:id/edit" element={<RecruiterJobForm />} />
            <Route path="jobs/:id/applications" element={<RecruiterApplications />} />
            <Route path="applicants" element={<div className="p-8"><h1 className="text-2xl font-bold">Applicants Placeholder</h1></div>} />
            <Route path="applications/:id" element={<RecruiterApplicationDetails />} />
            <Route path="notifications" element={<RecruiterNotifications />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRole="STUDENT"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="jobs" element={<StudentJobs />} />
            <Route path="jobs/:id" element={<StudentJobDetails />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="applications/:id" element={<StudentApplicationDetails />} />
            <Route path="saved-jobs" element={<StudentSavedJobs />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
