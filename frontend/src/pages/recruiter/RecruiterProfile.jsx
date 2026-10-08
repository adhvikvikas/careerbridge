import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecruiterProfile() {
  const { user } = useAuth();
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading profile..." />;

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <div className="pb-6 border-b border-border-light">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">MY PROFILE</div>
        <h1 className="text-3xl font-serif font-bold text-navy mb-2">Profile</h1>
        <p className="text-sm font-medium text-content-muted">Manage your account information.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success/20 text-status-success' : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      <Card className="p-8">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-navy text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
            {profile.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'R'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy mb-1">{profile.name || 'Recruiter'}</h2>
            <p className="text-sm text-content-muted mb-2">{user?.email}</p>
            <p className="text-xs font-semibold text-content-muted">Role<br/><span className="font-normal capitalize">{user?.role?.toLowerCase()}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            required
            placeholder="e.g. John Doe"
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            className="bg-base text-content-muted"
          />
          <Input
            label="Phone Number"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            placeholder="e.g. +91 98765 43210"
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" size="lg" loading={saving} className="px-8 shadow-sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
