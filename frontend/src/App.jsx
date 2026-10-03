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
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterJobForm from './pages/recruiter/RecruiterJobForm';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import RecruiterApplicationDetails from './pages/recruiter/RecruiterApplicationDetails';

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
    <div className="min-h-screen flex flex-col bg-inverted text-content-inverted font-sans selection:bg-accent selection:text-inverted">

      {/* Editorial Grid Lines */}
      <div className="fixed inset-0 grid-lines-dark opacity-40 pointer-events-none mix-blend-overlay z-0"></div>

      {/* Navigation */}
      <header className="h-24 px-8 md:px-12 flex items-center justify-between border-b border-border-dark relative z-20">
        <div className="text-2xl font-bold tracking-tighter">CAREERBRIDGE</div>
        <nav className="hidden md:flex items-center gap-12 text-xs font-bold tracking-widest uppercase text-content-inverted-muted">
          <a href="#product" className="hover:text-accent transition-colors">Product</a>
          <a href="#roles" className="hover:text-accent transition-colors">Roles</a>
          <a href="#process" className="hover:text-accent transition-colors">Process</a>
        </nav>
        <div>
          {user ? (
            <a href={`/${user.role.toLowerCase()}/dashboard`} className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-widest bg-accent text-inverted hover:bg-accent-hover transition-colors">
              Enter Platform
            </a>
          ) : (
            <a href="/login" className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent border border-border-dark text-content-inverted hover:border-content-inverted transition-colors">
              Sign In
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 relative z-10">

        {/* SECTION 1 - HERO */}
        <section className="min-h-[85vh] flex flex-col justify-center px-8 md:px-12 py-20 relative border-b border-border-dark">
          <div className="max-w-7xl">
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 border border-border-dark bg-inverted-surface text-xs font-bold uppercase tracking-widest text-accent">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              Platform Live for 2026 Placements
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.85] tracking-tighter mb-12 uppercase max-w-5xl text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-600">
              FIND YOUR NEXT<br/>
              <span className="text-accent">OPPORTUNITY.</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl items-end">
              <p className="text-xl md:text-2xl text-content-inverted-muted font-medium leading-relaxed">
                CareerBridge connects ambitious students, leading employers, and placement teams through one intelligent recruitment platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start md:justify-end">
                {user ? (
                  <Button variant="accent" size="lg" onClick={() => window.location.href=`/${user.role.toLowerCase()}/dashboard`}>
                    ENTER PORTAL <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button variant="accent" size="lg" onClick={() => window.location.href='/login'}>
                      EXPLORE OPPORTUNITIES
                    </Button>
                    <Button variant="outline-inverted" size="lg" onClick={() => window.location.href='/login'}>
                      FOR RECRUITERS
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Abstract Cinematic UI Preview */}
          <div className="absolute right-0 bottom-0 w-full md:w-[45vw] h-[50vh] border-t border-l border-border-dark bg-inverted-surface hidden lg:block overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-inverted to-transparent z-10" />
            <div className="p-8 grid gap-4 opacity-50 transform rotate-[-2deg] scale-110 origin-bottom-right">
              <div className="h-16 w-full border border-border-dark bg-inverted flex items-center px-6 gap-4">
                <div className="w-8 h-8 bg-accent" />
                <div className="h-2 w-32 bg-border-dark" />
                <div className="h-2 w-24 bg-border-dark ml-auto" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 border border-border-dark bg-inverted/50" />
                <div className="h-32 border border-border-dark bg-inverted/50" />
                <div className="h-32 border border-accent/20 bg-accent/5" />
              </div>
              <div className="h-48 border border-border-dark bg-inverted" />
            </div>
            <div className="absolute bottom-8 left-8 z-20 text-xs font-mono text-content-inverted-muted">
              SYS.STATUS: <span className="text-accent">ONLINE</span><br/>
              NODES: 14.2K<br/>
              REQ/S: 450
            </div>
          </div>
        </section>

        {/* SECTION 2 - PRODUCT STATEMENT */}
        <section id="product" className="py-32 px-8 md:px-12 border-b border-border-dark bg-inverted-surface relative overflow-hidden">
          <div className="max-w-5xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-tight mb-8">
              ONE PLATFORM.<br />
              <span className="text-content-inverted-muted">EVERY STEP OF THE</span><br />
              <span className="text-content-inverted-muted">PLACEMENT JOURNEY.</span>
            </h2>
            <div className="w-full h-px bg-border-dark my-12" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm font-semibold uppercase tracking-widest text-content-inverted-muted">
              <div className="flex flex-col gap-4">
                <span className="text-accent">01.</span>
                STUDENT PROFILE
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-accent">02.</span>
                OPPORTUNITY DISCOVERY
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-accent">03.</span>
                APPLICATION WORKFLOW
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-accent">04.</span>
                SELECTION
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - THREE ROLES */}
        <section id="roles" className="grid grid-cols-1 lg:grid-cols-3 border-b border-border-dark">
          <div className="p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-border-dark hover:bg-inverted-surface transition-colors group">
            <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 group-hover:text-accent transition-colors">Students</h3>
            <p className="text-content-inverted-muted mb-12 text-lg">
              Discover opportunities that match your profile and eligibility criteria with precision.
            </p>
            <div className="w-full h-48 border border-border-dark mb-12 relative overflow-hidden bg-inverted p-6 flex flex-col justify-end">
              <div className="absolute top-6 left-6 text-[10px] uppercase font-bold text-accent">Eligible ✓</div>
              <div className="text-xl font-bold uppercase tracking-tight">Software Engineer</div>
              <div className="text-xs text-content-inverted-muted mt-2">CTC: ₹14 LPA</div>
            </div>
            <Button variant="outline-inverted" className="w-full">Student Portal</Button>
          </div>

          <div className="p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-border-dark hover:bg-inverted-surface transition-colors group">
            <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 group-hover:text-accent transition-colors">Recruiters</h3>
            <p className="text-content-inverted-muted mb-12 text-lg">
              Manage job postings, applicant pipelines, and recruitment workflows from a unified command center.
            </p>
            <div className="w-full h-48 border border-border-dark mb-12 relative overflow-hidden bg-inverted p-6 flex flex-col justify-end">
              <div className="absolute top-6 right-6 text-[10px] uppercase font-bold bg-accent text-inverted px-2 py-1">24 New</div>
              <div className="text-xl font-bold uppercase tracking-tight">Applicants</div>
              <div className="text-xs text-content-inverted-muted mt-2">Pipeline under review</div>
            </div>
            <Button variant="outline-inverted" className="w-full">Recruiter Portal</Button>
          </div>

          <div className="p-12 md:p-16 hover:bg-inverted-surface transition-colors group">
            <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 group-hover:text-accent transition-colors">Administrators</h3>
            <p className="text-content-inverted-muted mb-12 text-lg">
              Control approvals, enforce governance, and maintain institutional workflows with immutable audit logs.
            </p>
            <div className="w-full h-48 border border-border-dark mb-12 relative overflow-hidden bg-inverted p-6 flex flex-col justify-end">
              <div className="absolute top-6 left-6 text-[10px] uppercase font-bold text-status-warning">Pending Approval</div>
              <div className="text-xl font-bold uppercase tracking-tight">Governance</div>
              <div className="text-xs text-content-inverted-muted mt-2">3 actions required</div>
            </div>
            <Button variant="outline-inverted" className="w-full">Admin Portal</Button>
          </div>
        </section>

        {/* SECTION 5 - HOW IT WORKS */}
        <section id="process" className="py-32 px-8 md:px-12 border-b border-border-dark">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div>
                <h2 className="text-5xl font-bold uppercase tracking-tighter leading-none sticky top-32">
                  THE SYSTEM<br/>
                  ARCHITECTURE.
                </h2>
              </div>
              <div className="space-y-24">
                <div className="relative pl-12 border-l border-border-dark">
                  <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-inverted border border-accent"></div>
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">01 — Discover</h4>
                  <h3 className="text-3xl font-bold uppercase tracking-tight mb-4">Smart Discovery</h3>
                  <p className="text-content-inverted-muted text-lg">
                    Find relevant opportunities matched exactly to your academic profile and department.
                  </p>
                </div>
                <div className="relative pl-12 border-l border-border-dark">
                  <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-inverted border border-accent"></div>
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">02 — Check</h4>
                  <h3 className="text-3xl font-bold uppercase tracking-tight mb-4">Eligibility Engine</h3>
                  <p className="text-content-inverted-muted text-lg">
                    Know immediately whether you qualify before applying, enforced securely on the backend.
                  </p>
                </div>
                <div className="relative pl-12 border-l border-border-dark">
                  <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-inverted border border-accent"></div>
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">03 — Apply & Track</h4>
                  <h3 className="text-3xl font-bold uppercase tracking-tight mb-4">Workflow Control</h3>
                  <p className="text-content-inverted-muted text-lg">
                    Submit applications and track status changes in real-time across the entire recruitment cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9 - CAPABILITIES */}
        <section className="py-32 px-8 md:px-12 border-b border-border-dark bg-inverted-surface">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold uppercase tracking-tighter mb-20 text-center">Platform Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
              {[
                { icon: <Box />, title: 'Smart Discovery' },
                { icon: <CheckSquare />, title: 'Eligibility' },
                { icon: <BarChart />, title: 'Tracking' },
                { icon: <Network />, title: 'Management' },
                { icon: <Lock />, title: 'Secure Access' },
                { icon: <Zap />, title: 'Approvals' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 border border-border-dark flex items-center justify-center mb-6 group-hover:border-accent group-hover:text-accent transition-colors">
                    {feature.icon}
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-2">{feature.title}</h4>
                  <div className="w-8 h-px bg-border-dark group-hover:bg-accent transition-colors mt-4" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10 - PRINCIPLES */}
        <section className="py-32 px-8 md:px-12 border-b border-border-dark">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Principle I</h4>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Role-Based</h3>
              <p className="text-sm text-content-inverted-muted">Every user sees only the tools and workflows strictly relevant to their role.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Principle II</h4>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Secure</h3>
              <p className="text-sm text-content-inverted-muted">Protected authentication, authorization, and data scoping enforced at the API layer.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Principle III</h4>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Structured</h3>
              <p className="text-sm text-content-inverted-muted">Every action follows defined approval workflows and precise status rules.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Principle IV</h4>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Transparent</h3>
              <p className="text-sm text-content-inverted-muted">Application activity and administrative governance actions are fully tracked.</p>
            </div>
          </div>
        </section>

        {/* SECTION 11 - FINAL CTA */}
        <section className="py-48 px-8 md:px-12 bg-accent text-inverted flex flex-col items-center text-center">
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
            YOUR NEXT<br/>OPPORTUNITY<br/>STARTS HERE.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button variant="inverted" size="lg" onClick={() => window.location.href='/login'}>
              GET STARTED
            </Button>
          </div>
        </section>
      </main>

      {/* SECTION 12 - FOOTER */}
      <footer className="py-24 px-8 md:px-12 border-t border-border-dark bg-inverted relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="text-3xl font-bold tracking-tighter mb-6">CAREERBRIDGE</div>
            <p className="text-sm text-content-inverted-muted max-w-xs">
              The premium institutional recruitment and placement management platform.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">Students</h4>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Jobs</a>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Applications</a>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Profile</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">Recruiters</h4>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Post Job</a>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Applicants</a>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Company Profile</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">Administration</h4>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Governance</a>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Approvals</a>
            <a href="#" className="text-sm text-content-inverted-muted hover:text-accent transition-colors">Audit Logs</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-border-dark flex flex-col md:flex-row justify-between items-center text-xs text-content-inverted-muted font-bold tracking-widest uppercase">
          <p>© 2026 CAREERBRIDGE INC.</p>
          <p>SYSTEM.ONLINE</p>
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
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<RecruiterJobForm />} />
            <Route path="jobs/:id/edit" element={<RecruiterJobForm />} />
            <Route path="jobs/:id/applications" element={<RecruiterApplications />} />
            <Route path="applications/:id" element={<RecruiterApplicationDetails />} />
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
