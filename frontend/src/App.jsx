import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
      <h1 className="text-3xl font-bold text-primary-900 mb-2">CareerBridge</h1>
      <p className="text-gray-600 mb-6">Institutional Recruitment & Placement Management</p>
      <div className="flex gap-4 justify-center">
        <a href="/login" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition shadow-sm font-medium">Login</a>
      </div>
    </div>
  </div>
);

const Placeholder = ({ title }) => (
  <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
    <p className="text-gray-500">Foundation phase placeholder</p>
    <a href="/" className="mt-8 text-primary-600 hover:underline">Back to Home</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Placeholder title="Login Portal" />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<Placeholder title="Student Portal" />} />
        <Route path="/student/dashboard" element={<Placeholder title="Student Dashboard" />} />
        <Route path="/student/jobs" element={<Placeholder title="Discover Jobs" />} />
        <Route path="/student/applications" element={<Placeholder title="My Applications" />} />
        <Route path="/student/profile" element={<Placeholder title="My Profile" />} />

        {/* Recruiter Routes */}
        <Route path="/recruiter" element={<Placeholder title="Recruiter Portal" />} />
        <Route path="/recruiter/dashboard" element={<Placeholder title="Recruiter Dashboard" />} />
        <Route path="/recruiter/company" element={<Placeholder title="Company Profile" />} />
        <Route path="/recruiter/jobs" element={<Placeholder title="Manage Jobs" />} />
        <Route path="/recruiter/applicants" element={<Placeholder title="Review Applicants" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Placeholder title="Admin Portal" />} />
        <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
        <Route path="/admin/companies" element={<Placeholder title="Manage Companies" />} />
        <Route path="/admin/jobs" element={<Placeholder title="Manage Jobs" />} />
        <Route path="/admin/audit-logs" element={<Placeholder title="Audit Logs" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
