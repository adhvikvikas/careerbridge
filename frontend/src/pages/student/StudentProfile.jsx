import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { User, GraduationCap, CheckSquare, AlertTriangle } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    branch: '',
    cgpa: '',
    graduationYear: '',
    resumeUrl: '',
    backlogs: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/student/profile');
      if (response.data.profile) {
        setProfile({
          branch: response.data.profile.branch || '',
          cgpa: response.data.profile.cgpa || '',
          graduationYear: response.data.profile.graduationYear || '',
          resumeUrl: response.data.profile.resumeUrl || '',
          backlogs: response.data.profile.backlogs ?? 0
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

      await api.patch('/student/profile', payload);
      setMessage({ type: 'success', text: 'PROFILE TELEMETRY UPDATED.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'FAILED TO UPDATE PROFILE.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING PROFILE TELEMETRY..." />;

  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-border-light">
        <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Student Profile</h1>
        <p className="text-sm font-medium text-content-muted">Manage your academic identifiers to check job eligibility accurately.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success/20 text-status-success' : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckSquare className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader className="border-b border-border-light bg-base/50">
            <CardTitle className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-content-muted" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Department / Branch"
                value={profile.branch}
                onChange={(e) => setProfile({...profile, branch: e.target.value})}
                options={[
                  { value: '', label: 'Select Department' },
                  ...branches.map(b => ({ value: b, label: b }))
                ]}
                required
              />
              <Input
                label="Graduation Year"
                type="number"
                min="2020"
                max="2030"
                value={profile.graduationYear}
                onChange={(e) => setProfile({...profile, graduationYear: e.target.value})}
                placeholder="e.g. 2026"
                required
              />
              <Input
                label="CGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => setProfile({...profile, cgpa: e.target.value})}
                placeholder="e.g. 8.5"
                required
              />
              <Input
                label="Active Backlogs"
                type="number"
                min="0"
                value={profile.backlogs}
                onChange={(e) => setProfile({...profile, backlogs: e.target.value})}
                placeholder="e.g. 0"
                required
              />
            </div>
            <div>
              <Input
                label="Resume URL"
                type="url"
                value={profile.resumeUrl}
                onChange={(e) => setProfile({...profile, resumeUrl: e.target.value})}
                placeholder="https://drive.google.com/..."
              />
              <p className="mt-1 text-xs text-content-muted">Provide a link to your hosted resume (e.g., Google Drive link)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6">
          <Button type="submit" loading={saving} variant="primary" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
