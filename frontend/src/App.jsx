import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobs from './pages/student/StudentJobs';
import StudentJobDetails from './pages/student/StudentJobDetails';
import StudentApplications from './pages/student/StudentApplications';
import StudentApplicationDetails from './pages/student/StudentApplicationDetails';
import StudentSavedJobs from './pages/student/StudentSavedJobs';
import StudentNotifications from './pages/student/StudentNotifications';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterJobForm from './pages/recruiter/RecruiterJobForm';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import RecruiterApplicationDetails from './pages/recruiter/RecruiterApplicationDetails';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">CareerBridge</h1>
        <p className="text-gray-600 mb-6">Institutional Recruitment & Placement Management</p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <a href={`/${user.role.toLowerCase()}/dashboard`} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition shadow-sm font-medium">Go to Portal</a>
          ) : (
            <a href="/login" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition shadow-sm font-medium">Login</a>
          )}
        </div>
      </div>
    </div>
  );
};

const Placeholder = ({ title }) => {
  const { logout, user } = useAuth();
  
  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email} ({user.role})</span>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition shadow-sm text-sm font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 w-full max-w-4xl text-center">
        <p className="text-gray-500">Foundation phase placeholder</p>
        <a href="/" className="mt-8 inline-block text-primary-600 hover:underline">Back to Home</a>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <Routes>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="jobs" element={<StudentJobs />} />
            <Route path="jobs/:id" element={<StudentJobDetails />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="applications/:id" element={<StudentApplicationDetails />} />
            <Route path="saved-jobs" element={<StudentSavedJobs />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<StudentProfile />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Recruiter Routes */}
      <Route path="/recruiter/*" element={
        <ProtectedRoute allowedRoles={['RECRUITER']}>
          <Routes>
            <Route path="" element={<RecruiterDashboard />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<RecruiterJobForm />} />
            <Route path="jobs/:id/edit" element={<RecruiterJobForm />} />
            <Route path="jobs/:id/applications" element={<RecruiterApplications />} />
            <Route path="applications/:id" element={<RecruiterApplicationDetails />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Routes>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Routes>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
