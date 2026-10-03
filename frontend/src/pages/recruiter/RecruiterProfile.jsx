import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { Building2, CheckSquare, AlertTriangle } from 'lucide-react';

export default function RecruiterProfile() {
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: ''
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
          companyName: response.data.profile.companyName || '',
          industry: response.data.profile.industry || '',
          website: response.data.profile.website || '',
          description: response.data.profile.description || ''
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
      await api.post('/recruiter/profile', profile);
      setMessage({ type: 'success', text: 'PROFILE UPDATED AND SUBMITTED FOR REVIEW.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'FAILED TO UPDATE PROFILE.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING ENTITY PROFILE..." />;

  return (
    <div className="space-y-12 max-w-4xl">
      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">CORPORATE ENTITY PROFILE</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Manage your organization's identity within the platform.</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="w-5 h-5" />
              Entity Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <Input
              label="Entity Name"
              value={profile.companyName}
              onChange={(e) => setProfile({...profile, companyName: e.target.value})}
              required
              placeholder="e.g. Acme Corp"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Sector / Industry"
                value={profile.industry}
                onChange={(e) => setProfile({...profile, industry: e.target.value})}
                required
                placeholder="e.g. Technology"
              />
              <Input
                label="Domain / Website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                required
                placeholder="https://..."
              />
            </div>

            <Textarea
              label="Entity Description"
              value={profile.description}
              onChange={(e) => setProfile({...profile, description: e.target.value})}
              required
              rows={6}
              placeholder="Provide a comprehensive overview of the organization..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-8 border-t border-border-dark">
          <Button type="submit" variant="inverted" size="lg" loading={saving}>
            COMMIT PROFILE CHANGES
          </Button>
        </div>
      </form>
    </div>
  );
}
