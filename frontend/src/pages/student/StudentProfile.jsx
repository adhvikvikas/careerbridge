import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    branch: '',
    cgpa: '',
    graduationYear: '',
    resumeUrl: '',
    backlogs: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('academic');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api('/student/profile');
      if (response.success && response.profile) {
        setProfile({
          name: response.profile.name || '',
          branch: response.profile.branch || '',
          cgpa: response.profile.cgpa || '',
          graduationYear: response.profile.graduationYear || '',
          resumeUrl: response.profile.resumeUrl || '',
          backlogs: response.profile.backlogs ?? 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...profile,
        cgpa: profile.cgpa ? parseFloat(profile.cgpa) : null,
        graduationYear: profile.graduationYear ? parseInt(profile.graduationYear) : null,
        backlogs: profile.backlogs !== '' ? parseInt(profile.backlogs) : 0
      };

      await api('/student/profile', { method: 'PATCH', body: JSON.stringify(payload) });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading Profile..." />;

  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  const profileFields = ['name', 'branch', 'cgpa', 'graduationYear', 'resumeUrl', 'backlogs'];
  const completedFieldsCount = profileFields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '').length;
  const profileProgress = Math.round((completedFieldsCount / profileFields.length) * 100) || 0;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">My Profile</div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-2">
          Profile
        </h1>
        <p className="text-content-muted">Keep your information updated to improve your chances.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Top Profile Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-24 h-24 bg-navy text-white rounded-full flex items-center justify-center font-bold text-4xl shrink-0 shadow-sm">
          {user?.email?.[0].toUpperCase() || 'S'}
        </div>
        
        <div className="flex-1 text-center md:text-left w-full">
          <h2 className="text-2xl font-bold text-navy mb-1">{profile.name || user?.email?.split('@')[0] || 'Student User'}</h2>
          <p className="text-content-muted mb-6">{user?.email}</p>
          
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm font-bold text-navy mb-2">
              <span>Profile Completion</span>
              <span>{profileProgress}%</span>
            </div>
            <div className="h-2 w-full bg-base rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${profileProgress}%` }}
              />
            </div>
            <p className="text-xs text-content-muted">Complete your profile to unlock more opportunities and get better job recommendations.</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex border-b border-border-light overflow-x-auto">
            {['personal', 'academic', 'resume'].map(tab => (
              <button
                key={tab}
                type="button"
                className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-content-muted hover:text-navy hover:bg-base'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'personal' ? 'Personal Information' : tab === 'academic' ? 'Academic Details' : 'Resume'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none mb-4"
                  />
                  <label className="block text-sm font-bold text-navy mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-content-muted bg-base cursor-not-allowed"
                  />
                  <p className="text-xs text-content-muted mt-1">Email is managed by your institution.</p>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Branch / Department</label>
                  <select
                    className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none"
                    value={profile.branch}
                    onChange={(e) => setProfile({...profile, branch: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Graduation Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    placeholder="e.g. 2026"
                    className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none"
                    value={profile.graduationYear}
                    onChange={(e) => setProfile({...profile, graduationYear: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.5"
                    className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none"
                    value={profile.cgpa}
                    onChange={(e) => setProfile({...profile, cgpa: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy mb-2">Backlogs (if any)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 0"
                    className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none"
                    value={profile.backlogs}
                    onChange={(e) => setProfile({...profile, backlogs: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="max-w-xl">
                <label className="block text-sm font-bold text-navy mb-2">Resume URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none"
                  value={profile.resumeUrl}
                  onChange={(e) => setProfile({...profile, resumeUrl: e.target.value})}
                />
                <p className="mt-2 text-xs text-content-muted">Provide a link to your hosted resume (e.g., Google Drive, Dropbox). Ensure the link is publicly accessible.</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving} variant="primary" className="px-8 font-bold">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
