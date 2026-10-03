import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { User, GraduationCap, CheckSquare, AlertTriangle } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    department: '',
    cgpa: '',
    graduationYear: '',
    resumeUrl: ''
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
          fullName: response.data.profile.fullName || '',
          phone: response.data.profile.phone || '',
          department: response.data.profile.department || '',
          cgpa: response.data.profile.cgpa || '',
          graduationYear: response.data.profile.graduationYear || '',
          resumeUrl: response.data.profile.resumeUrl || ''
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
        graduationYear: profile.graduationYear ? parseInt(profile.graduationYear) : null
      };

      await api.post('/student/profile', payload);
      setMessage({ type: 'success', text: 'PROFILE TELEMETRY UPDATED.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'FAILED TO UPDATE PROFILE.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING PROFILE TELEMETRY..." />;

  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  return (
    <div className="space-y-12 max-w-5xl">
      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">STUDENT PROFILE</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Manage your personal and academic identifiers.</p>
      </div>

      {message && (
        <div className={`p-6 border text-xs font-bold uppercase tracking-widest flex items-center gap-4 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success text-status-success' : 'bg-status-danger/10 border-status-danger text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckSquare className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="w-5 h-5" />
                Personal Identifiers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <Input
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                required
                placeholder="e.g. John Doe"
              />
              <Input
                label="Phone Designation"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="+91 XXXXX XXXXX"
              />
              <Input
                label="Resume URL"
                type="url"
                value={profile.resumeUrl}
                onChange={(e) => setProfile({...profile, resumeUrl: e.target.value})}
                placeholder="https://drive.google.com/..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                Academic Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <Select
                label="Department Classification"
                value={profile.department}
                onChange={(e) => setProfile({...profile, department: e.target.value})}
                options={[
                  { value: '', label: 'Select Classification' },
                  ...branches.map(b => ({ value: b, label: b }))
                ]}
                required
              />
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="CGPA Metric"
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
                  label="Graduation Year"
                  type="number"
                  min="2020"
                  max="2030"
                  value={profile.graduationYear}
                  onChange={(e) => setProfile({...profile, graduationYear: e.target.value})}
                  placeholder="e.g. 2026"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-8 border-t border-border-dark">
          <Button type="submit" loading={saving} variant="inverted" size="lg">
            COMMIT PROFILE CHANGES
          </Button>
        </div>
      </form>
    </div>
  );
}
