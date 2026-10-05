import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/recruiter/dashboard-stats');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="INITIALIZING WORKSPACE..." />;
  if (error) return <ErrorState message={error} />;

  const { companyStatus, companyRejectionReason, stats, recentJobs } = data;
  const isApproved = companyStatus === 'APPROVED';

  return (
    <div className="space-y-8">

      {/* Profile Status Alert */}
      {companyStatus !== 'APPROVED' && (
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          companyStatus === 'PENDING' ? 'border-status-warning/30 bg-status-warning/10' : 'border-status-danger/30 bg-status-danger/10'
        }`}>
          <div className="flex items-start gap-4">
            <AlertTriangle className={`w-8 h-8 shrink-0 mt-1 ${companyStatus === 'PENDING' ? 'text-status-warning' : 'text-status-danger'}`} />
            <div>
              <h3 className={`text-lg font-bold mb-1 ${companyStatus === 'PENDING' ? 'text-status-warning' : 'text-status-danger'}`}>
                Account Status: {companyStatus}
              </h3>
              <p className="text-sm font-medium text-content-muted leading-relaxed max-w-3xl">
                {companyStatus === 'PENDING'
                  ? 'Your company profile is under administrative review. You may create job postings, but they will not be visible to students until your profile is approved.'
                  : `Your company profile was rejected. Reason: ${companyRejectionReason || 'No reason provided.'}. Please update your profile.`}
              </p>
            </div>
          </div>
          {companyStatus === 'REJECTED' && (
            <Button variant="outline" className="shrink-0 whitespace-nowrap" onClick={() => window.location.href='/recruiter/company'}>
              Update Company Profile
            </Button>
          )}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface p-8 md:p-12 rounded-2xl shadow-sm border border-border-light flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="text-xs font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Recruiter Interface Active
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-content mb-3">
            Command Center
          </h1>
          <p className="text-sm font-medium text-content-muted">
            Manage your opportunities and review candidates. Logged in as <span className="font-semibold text-content">{user.email}</span>
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="lg" disabled={!isApproved}>
              Post Opportunity <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Pipeline Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Active Opportunities</p>
            <h3 className="text-4xl font-bold text-content">{stats.activeJobs}</h3>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Pending Opportunities</p>
            <h3 className="text-4xl font-bold text-content">{stats.pendingJobs}</h3>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Total Applicants</p>
            <h3 className="text-4xl font-bold text-content">{stats.totalApplicants}</h3>
          </Card>
        </div>
      </div>

      {/* Recent Jobs */}
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-base/50 rounded-t-2xl">
          <h3 className="text-base font-bold text-content">Recent Postings</h3>
          <Link to="/recruiter/jobs" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="divide-y divide-border-light">
          {recentJobs?.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-content-muted">No opportunities posted.</div>
          ) : (
            recentJobs?.map(job => (
              <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base/50 transition-colors">
                <div>
                  <h4 className="text-lg font-bold text-content">{job.title}</h4>
                  <p className="text-sm font-medium text-content-muted mt-1">
                    {job.jobType.replace('_', ' ')} &bull; Created {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
