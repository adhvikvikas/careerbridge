import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';

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
            <Route path="" element={<Placeholder title="Student Portal" />} />
            <Route path="dashboard" element={<Placeholder title="Student Dashboard" />} />
            <Route path="jobs" element={<Placeholder title="Discover Jobs" />} />
            <Route path="applications" element={<Placeholder title="My Applications" />} />
            <Route path="profile" element={<Placeholder title="My Profile" />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Recruiter Routes */}
      <Route path="/recruiter/*" element={
        <ProtectedRoute allowedRoles={['RECRUITER']}>
          <Routes>
            <Route path="" element={<Placeholder title="Recruiter Portal" />} />
            <Route path="dashboard" element={<Placeholder title="Recruiter Dashboard" />} />
            <Route path="company" element={<Placeholder title="Company Profile" />} />
            <Route path="jobs" element={<Placeholder title="Manage Jobs" />} />
            <Route path="applicants" element={<Placeholder title="Review Applicants" />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Routes>
            <Route path="" element={<Placeholder title="Admin Portal" />} />
            <Route path="dashboard" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="companies" element={<Placeholder title="Manage Companies" />} />
            <Route path="jobs" element={<Placeholder title="Manage Jobs" />} />
            <Route path="audit-logs" element={<Placeholder title="Audit Logs" />} />
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
