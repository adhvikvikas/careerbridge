import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Building2, Globe, MapPin, Briefcase, AlertTriangle, CheckSquare } from 'lucide-react';

export default function RecruiterCompany() {
  const [company, setCompany] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    location: ''
  });
  const [status, setStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await api.get('/recruiter/profile');
      const companies = response.data.profile?.companies || [];
      if (companies.length > 0) {
        const comp = companies[0];
        setCompany({
          name: comp.name || '',
          description: comp.description || '',
          website: comp.website || '',
          industry: comp.industry || '',
          location: comp.location || ''
        });
        setStatus(comp.status);
        setRejectionReason(comp.rejectionReason);
        setIsNew(false);
      } else {
        setIsNew(true);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load company profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (isNew) {
        const response = await api.post('/recruiter/company', company);
        setStatus(response.data.company.status);
        setRejectionReason(response.data.company.rejectionReason);
        setIsNew(false);
        setMessage({ type: 'success', text: 'Company profile created successfully.' });
      } else {
        const response = await api.patch('/recruiter/company', company);
        setStatus(response.data.company.status);
        setRejectionReason(response.data.company.rejectionReason);
        setMessage({ type: 'success', text: 'Company profile updated successfully.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save company profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="LOADING COMPANY PROFILE..." />;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Company Profile</h1>
          <p className="text-sm font-medium text-content-muted">Manage your organization's details and approval status.</p>
        </div>
        {status && (
          <div className="shrink-0 flex items-center gap-3 bg-surface border border-border-light px-4 py-2 rounded-xl shadow-sm">
            <span className="text-sm font-bold text-content-muted">STATUS:</span>
            <StatusBadge status={status} />
          </div>
        )}
      </div>

      {status === 'PENDING' && (
        <div className="p-4 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning text-sm font-medium flex flex-col sm:flex-row gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Your company profile is under administrative review. You must wait for approval before posting opportunities that are visible to students.</span>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="p-4 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger text-sm font-medium flex flex-col sm:flex-row gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Your company profile was rejected. Reason: {rejectionReason || 'No reason provided.'}. Please update the information and save to resubmit.</span>
        </div>
      )}

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
              <Building2 className="w-5 h-5 text-content-muted" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                value={company.name}
                onChange={(e) => setCompany({...company, name: e.target.value})}
                required
                placeholder="e.g. Google India"
              />
              <Input
                label="Industry / Domain"
                value={company.industry}
                onChange={(e) => setCompany({...company, industry: e.target.value})}
                required
                icon={<Briefcase className="w-4 h-4" />}
                placeholder="e.g. Information Technology"
              />
              <Input
                label="Headquarters Location"
                value={company.location}
                onChange={(e) => setCompany({...company, location: e.target.value})}
                required
                icon={<MapPin className="w-4 h-4" />}
                placeholder="e.g. Bangalore, KA"
              />
              <Input
                label="Website URL"
                type="url"
                value={company.website}
                onChange={(e) => setCompany({...company, website: e.target.value})}
                required
                icon={<Globe className="w-4 h-4" />}
                placeholder="https://example.com"
              />
            </div>
            <Textarea
              label="Company Description"
              value={company.description}
              onChange={(e) => setCompany({...company, description: e.target.value})}
              required
              rows={5}
              placeholder="Provide a detailed description of your company, its mission, and its work culture."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6">
          <Button type="submit" loading={saving} variant="primary" size="lg">
            {isNew ? 'Create Company Profile' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
