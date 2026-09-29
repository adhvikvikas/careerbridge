import React, { useEffect, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import api from '../../services/api';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    branch: '',
    cgpa: '',
    graduationYear: '',
    resumeUrl: '',
    backlogs: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        setProfile(res.data.profile);
        setFormData({
          branch: res.data.profile.branch || '',
          cgpa: res.data.profile.cgpa || '',
          graduationYear: res.data.profile.graduationYear || '',
          resumeUrl: res.data.profile.resumeUrl || '',
          backlogs: res.data.profile.backlogs ?? 0
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {};
    if (formData.branch) payload.branch = formData.branch;
    if (formData.cgpa) payload.cgpa = parseFloat(formData.cgpa);
    if (formData.graduationYear) payload.graduationYear = parseInt(formData.graduationYear, 10);
    payload.resumeUrl = formData.resumeUrl; // Allow empty string
    if (formData.backlogs !== '') payload.backlogs = parseInt(formData.backlogs, 10);

    try {
      const res = await api.patch('/student/profile', payload);
      setProfile(res.data.profile);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(', '));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudentLayout title="My Profile"><div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></StudentLayout>;

  return (
    <StudentLayout title="My Profile">
      <div className="max-w-3xl mx-auto">
        {message && <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md">{message}</div>}
        {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">{error}</div>}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-800">Account Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">{profile?.user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <div className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">{new Date(profile?.user?.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-800">Academic Profile</h2>
            <p className="text-sm text-gray-500">Update your details to check job eligibility accurately.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department / Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                  placeholder="e.g., CSE, IT, ECE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  min="2000"
                  max="2100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CGPA</label>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="10"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Active Backlogs</label>
                <input
                  type="number"
                  name="backlogs"
                  value={formData.backlogs}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resume URL</label>
              <input
                type="url"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://link-to-your-resume.pdf"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
              <p className="mt-1 text-xs text-gray-500">Provide a link to your hosted resume (e.g., Google Drive link)</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
