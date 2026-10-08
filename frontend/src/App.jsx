import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobDetails from './pages/admin/AdminJobDetails';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminCompanyDetails from './pages/admin/AdminCompanyDetails';

import RecruiterLayout from './components/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import RecruiterCompany from './pages/recruiter/RecruiterCompany';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterJobForm from './pages/recruiter/RecruiterJobForm';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import RecruiterJobDetails from './pages/recruiter/RecruiterJobDetails';
import RecruiterAllApplications from './pages/recruiter/RecruiterAllApplications';
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

import { ArrowRight, GraduationCap, Building2, Users, Shield, CheckSquare, TrendingUp } from 'lucide-react';
import { Button } from './components/ui/Button';
import campusHeroImage from './assets/careerbridge-campus-hero.jpg';
import LandingPage from './pages/public/LandingPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="companies/:id" element={<AdminCompanyDetails />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="jobs/:id" element={<AdminJobDetails />} />
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
            <Route path="jobs/:id" element={<RecruiterJobDetails />} />
            <Route path="jobs/:id/applications" element={<RecruiterApplications />} />
            <Route path="applications" element={<RecruiterAllApplications />} />
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

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
