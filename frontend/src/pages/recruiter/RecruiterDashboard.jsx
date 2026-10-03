import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/recruiter/dashboard');
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
    <div className="space-y-16">

      {/* Profile Status Alert */}
      {companyStatus !== 'APPROVED' && (
        <div className={`p-8 border-2 flex items-start gap-6 ${companyStatus === 'PENDING' ? 'border-status-warning bg-status-warning/5' : 'border-status-danger bg-status-danger/5'}`}>
          <AlertTriangle className={`w-10 h-10 shrink-0 ${companyStatus === 'PENDING' ? 'text-status-warning' : 'text-status-danger'}`} />
          <div>
            <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 ${companyStatus === 'PENDING' ? 'text-status-warning' : 'text-status-danger'}`}>
              Account Status: {companyStatus}
            </h3>
            <p className="text-sm font-semibold uppercase tracking-widest text-content-muted leading-relaxed">
              {companyStatus === 'PENDING'
                ? 'Your company profile is under administrative review. You may create job postings, but they will not be visible to students until your profile is approved.'
                : `Your company profile was rejected. Reason: ${companyRejectionReason || 'No reason provided.'}. Please update your profile.`}
            </p>
            {companyStatus === 'REJECTED' && (
              <Button variant="outline-inverted" className="mt-6" onClick={() => window.location.href='/recruiter/profile'}>
                UPDATE PROFILE
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-inverted text-content-inverted p-12 lg:p-24 relative overflow-hidden border border-border-dark flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="absolute inset-0 grid-lines-dark opacity-40 pointer-events-none mix-blend-overlay z-0"></div>
        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-6 border-l-2 border-accent pl-3">
            Recruiter Interface Active
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-6">
            COMMAND CENTER<br/>
            <span className="text-content-inverted-muted">{user.email}</span>
          </h1>
        </div>
        <div className="relative z-10 shrink-0">
          <Link to="/recruiter/jobs/new">
            <Button variant="accent" size="lg" disabled={!isApproved}>
              POST OPPORTUNITY <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted mb-6">Pipeline Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-border-light bg-surface">
          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Active Opportunities</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.activeJobs}</h3>
          </div>

          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Pending Opportunities</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.pendingJobs}</h3>
          </div>

          <div className="p-8 hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Total Applicants</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.totalApplicants}</h3>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted">Recent Postings</h3>
          <Link to="/recruiter/jobs" className="text-xs font-bold uppercase tracking-widest text-inverted hover:underline">
            View Pipeline
          </Link>
        </div>
        <div className="border border-border-light bg-surface divide-y divide-border-light">
          {recentJobs?.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-content-muted">NO OPPORTUNITIES POSTED.</div>
          ) : (
            recentJobs?.map(job => (
              <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base transition-colors">
                <div>
                  <h4 className="text-lg font-bold tracking-tight uppercase">{job.title}</h4>
                  <p className="text-xs font-semibold uppercase tracking-widest text-content-muted mt-2">
                    {job.jobType} <span className="mx-2">/</span> Created {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
