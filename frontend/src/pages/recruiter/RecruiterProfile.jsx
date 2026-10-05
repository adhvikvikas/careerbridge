import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { User, CheckSquare, AlertTriangle } from 'lucide-react';

export default function RecruiterProfile() {
  const [profile, setProfile] = useState({
    name: '',
    phone: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/recruiter/profile');
      if (response.data.profile) {
        setProfile({
          name: response.data.profile.name || '',
          phone: response.data.profile.phone || ''
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
      const response = await api.patch('/recruiter/profile', profile);
      setProfile({
        name: response.data.profile.name || '',
        phone: response.data.profile.phone || ''
      });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="LOADING PROFILE..." />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="pb-6 border-b border-border-light">
        <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Personal Profile</h1>
        <p className="text-sm font-medium text-content-muted">Manage your personal recruiter contact details.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
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
              <User className="w-5 h-5 text-content-muted" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                required
                placeholder="e.g. John Doe"
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
