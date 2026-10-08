import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Plus, FileText, CheckCircle2, Clock, XCircle, Users, CheckSquare, Briefcase, ChevronRight } from 'lucide-react';
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

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;

  const { stats, companyStatus, companyRejectionReason, recentJobs = [], recentApplications = [] } = data;
  const isApproved = companyStatus === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {companyStatus && companyStatus !== 'APPROVED' && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          companyStatus === 'PENDING' ? 'bg-status-warning/10 border-status-warning/20' : 'bg-status-danger/10 border-status-danger/20'
        }`}>
          <div>
            <h3 className={`font-semibold ${companyStatus === 'PENDING' ? 'text-status-warning' : 'text-status-danger'}`}>
              Account Status: {companyStatus}
            </h3>
            <p className="text-sm mt-1 text-content-muted">
              {companyStatus === 'PENDING'
                ? 'Your company profile is under administrative review. Job postings will not be visible to students until approved.'
                : `Your company profile was rejected: ${companyRejectionReason || 'Please update your profile.'}`}
            </p>
          </div>
          {companyStatus === 'REJECTED' && (
            <Link to="/recruiter/company">
              <Button variant="outline" size="sm">Update Profile</Button>
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">RECRUITER DASHBOARD</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">
            Good morning, {data.profile?.name || user.email?.split('@')[0] || 'recruiter'}
          </h1>
          <p className="text-content-muted text-base">Here's an overview of your hiring activity.</p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" disabled={!isApproved} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Post New Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-content-muted mb-0.5">Total Jobs</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{stats.jobs?.total || 0}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-warning/10 text-status-warning rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-content-muted mb-0.5">Pending</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{stats.jobs?.pending || 0}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-success/10 text-status-success rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-content-muted mb-0.5">Approved</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{stats.jobs?.approved || 0}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-danger/10 text-status-danger rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-content-muted mb-0.5">Rejected</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{stats.jobs?.rejected || 0}</h3>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-navy mb-4">Applications Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 border border-border-light text-content-muted rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-muted mb-0.5">Total Applications</p>
              <h3 className="text-2xl font-bold text-navy leading-none">{stats.applications?.total || 0}</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-muted mb-0.5">Under Review</p>
              <h3 className="text-2xl font-bold text-navy leading-none">{stats.applications?.underReview || 0}</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-muted mb-0.5">Shortlisted</p>
              <h3 className="text-2xl font-bold text-navy leading-none">{stats.applications?.shortlisted || 0}</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-status-success/10 text-status-success rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-muted mb-0.5">Selected</p>
              <h3 className="text-2xl font-bold text-navy leading-none">{stats.applications?.selected || 0}</h3>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Recent Jobs
            </h3>
            <Link to="/recruiter/jobs" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center">
              View all jobs <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <Card className="divide-y divide-border-light overflow-hidden">
            {recentJobs.length === 0 ? (
              <div className="p-8 text-center text-sm text-content-muted bg-surface/50">
                No jobs posted yet.
              </div>
            ) : (
              recentJobs.slice(0, 5).map(job => (
                <div key={job.id} className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-base/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-base border border-border-light rounded-lg flex items-center justify-center shrink-0 text-navy font-bold shadow-sm">
                      {job.company?.name?.[0] || 'C'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-navy truncate">{job.title}</h4>
                      <p className="text-xs text-content-muted mt-0.5 truncate">
                        {job.company?.name || 'Company'}
                      </p>
                      <p className="text-[11px] text-content-muted mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Deadline: {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                    <StatusBadge status={job.status} size="sm" />
                    <Link to={`/recruiter/jobs/${job.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs">View Job</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Recent Applications
            </h3>
            <Link to="/recruiter/applications" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center">
              View all applications <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <Card className="divide-y divide-border-light overflow-hidden">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-sm text-content-muted bg-surface/50">
                No recent applications found.
              </div>
            ) : (
              recentApplications.slice(0, 5).map(app => (
                <Link to={`/recruiter/applications/${app.id}`} key={app.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-base/50 transition-colors block">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-base rounded-full border border-border-light flex items-center justify-center shrink-0 text-navy font-bold text-sm">
                      {(app.student?.name || app.student?.user?.name || app.student?.user?.email || 'S')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-navy truncate">{app.student?.name || app.student?.user?.name || app.student?.user?.email?.split('@')[0] || 'Unknown Candidate'}</h4>
                      <p className="text-xs text-content-muted mt-0.5 truncate">{app.job?.title}</p>
                      <p className="text-[11px] text-content-muted mt-1">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                </Link>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
