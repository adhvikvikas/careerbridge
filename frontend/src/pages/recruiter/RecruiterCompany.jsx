import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Building2, Globe, MapPin, Briefcase, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
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
        setIsEditing(false);
      } else {
        setIsNew(true);
        setIsEditing(true);
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
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Company profile created successfully.' });
      } else {
        const response = await api.patch('/recruiter/company', company);
        setStatus(response.data.company.status);
        setRejectionReason(response.data.company.rejectionReason);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Company profile updated successfully.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save company profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading company profile..." />;

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div className="pb-6 border-b border-border-light">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">COMPANY</div>
        <h1 className="text-3xl font-serif font-bold text-navy mb-2">Company Profile</h1>
        <p className="text-sm font-medium text-content-muted">Manage your company information and keep it updated.</p>
      </div>

      {status === 'APPROVED' && !isEditing && (
        <div className="p-4 rounded-xl border border-status-success/20 bg-status-success/5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-status-success mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-status-success mb-0.5">Your company has been approved</h4>
            <p className="text-sm text-status-success/80">Your company is visible to students and you can post job opportunities.</p>
          </div>
        </div>
      )}

      {status === 'PENDING' && !isEditing && (
        <div className="p-4 rounded-xl border border-status-warning/20 bg-status-warning/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-status-warning mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-status-warning mb-0.5">Your company is awaiting Placement Cell approval.</h4>
            <p className="text-sm text-status-warning/80">You can create jobs, but they won't be visible to students until approved.</p>
          </div>
        </div>
      )}

      {status === 'REJECTED' && !isEditing && (
        <div className="p-4 rounded-xl border border-status-danger/20 bg-status-danger/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-status-danger mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-status-danger mb-0.5">Your company registration was rejected.</h4>
            <p className="text-sm text-status-danger/80">Reason: {rejectionReason || 'No reason provided.'}</p>
          </div>
        </div>
      )}

      {!isEditing ? (
        <Card className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-base border border-border-light rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-2xl font-bold text-navy">{company.name?.[0] || 'C'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy mb-2">{company.name || 'Company Name'}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-content-muted mb-3">
                  <span>{company.industry || 'Industry not set'}</span>
                  <span className="w-1 h-1 rounded-full bg-border-light" />
                  <span>{company.location || 'Location not set'}</span>
                </div>
                {status && <StatusBadge status={status} />}
              </div>
            </div>
            <Button variant="outline" className="shrink-0 text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40" onClick={() => setIsEditing(true)}>
              Edit Company
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Globe className="w-4 h-4 text-content-muted" /> Website
              </div>
              <div className="text-sm text-content-muted">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {company.website}
                  </a>
                ) : 'Not provided'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Briefcase className="w-4 h-4 text-content-muted" /> Industry
              </div>
              <div className="text-sm text-content-muted">{company.industry || 'Not provided'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <MapPin className="w-4 h-4 text-content-muted" /> Location
              </div>
              <div className="text-sm text-content-muted">{company.location || 'Not provided'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 items-start">
              <div className="flex items-center gap-2 text-sm font-bold text-navy pt-0.5">
                <Building2 className="w-4 h-4 text-content-muted" /> Description
              </div>
              <div className="text-sm text-content-muted leading-relaxed whitespace-pre-wrap">
                {company.description || 'Not provided'}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-navy">Edit Organization Details</h2>
            </div>
            <div className="space-y-6">
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
                  placeholder="e.g. Information Technology"
                />
                <Input
                  label="Headquarters Location"
                  value={company.location}
                  onChange={(e) => setCompany({...company, location: e.target.value})}
                  required
                  placeholder="e.g. Bangalore, KA"
                />
                <Input
                  label="Website URL"
                  type="url"
                  value={company.website}
                  onChange={(e) => setCompany({...company, website: e.target.value})}
                  required
                  placeholder="https://example.com"
                />
              </div>
              <Textarea
                label="Company Description"
                value={company.description}
                onChange={(e) => setCompany({...company, description: e.target.value})}
                required
                rows={6}
                placeholder="Provide a detailed description of your company, its mission, and its work culture."
              />
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            {!isNew && (
              <Button type="button" variant="outline" onClick={() => {
                setIsEditing(false);
                setMessage(null);
                fetchCompany();
              }}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={saving} variant="primary" className="px-8 shadow-sm">
              {isNew ? 'Create Company' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
