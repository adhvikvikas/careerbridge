import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        setStats(response.data.stats);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="INITIALIZING ADMIN CONSOLE..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-16">

      {/* Hero Header */}
      <div className="bg-inverted text-content-inverted p-12 lg:p-24 relative overflow-hidden border border-border-dark">
        <div className="absolute inset-0 grid-lines-dark opacity-40 pointer-events-none mix-blend-overlay z-0"></div>
        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-6 border-l-2 border-accent pl-3">
            System Level: Administration
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-6">
            PLATFORM GOVERNANCE<br/>
            <span className="text-content-inverted-muted">COMMAND CENTER</span>
          </h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-inverted-muted max-w-md">
            Monitor system health and execute required approval workflows.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted mb-6">System Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border-light bg-surface">
          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Total Students</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.totalStudents}</h3>
          </div>

          <div className="p-8 border-b lg:border-b-0 lg:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Registered Companies</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.totalCompanies}</h3>
          </div>

          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Pending Company Approvals</p>
            <h3 className={`text-5xl font-bold tracking-tighter ${stats.pendingCompanies > 0 ? 'text-status-warning' : ''}`}>{stats.pendingCompanies}</h3>
          </div>

          <div className="p-8 hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Pending Job Approvals</p>
            <h3 className={`text-5xl font-bold tracking-tighter ${stats.pendingJobs > 0 ? 'text-status-warning' : ''}`}>{stats.pendingJobs}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Pending Companies */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted">Requires Action: Companies</h3>
            <Link to="/admin/companies" className="text-xs font-bold uppercase tracking-widest text-inverted hover:underline">
              Execute Workflow
            </Link>
          </div>
          <div className="border border-border-light bg-surface divide-y divide-border-light">
            {stats.recentPendingCompanies?.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-content-muted">ALL CLEAR. NO PENDING ENTITIES.</div>
            ) : (
              stats.recentPendingCompanies?.map(company => (
                <div key={company.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base transition-colors">
                  <div>
                    <h4 className="text-lg font-bold tracking-tight uppercase">{company.companyName}</h4>
                    <p className="text-xs font-semibold uppercase tracking-widest text-content-muted mt-2">
                      {company.user.email} <span className="mx-2">/</span> {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={company.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted">Requires Action: Opportunities</h3>
            <Link to="/admin/jobs" className="text-xs font-bold uppercase tracking-widest text-inverted hover:underline">
              Execute Workflow
            </Link>
          </div>
          <div className="border border-border-light bg-surface divide-y divide-border-light">
            {stats.recentPendingJobs?.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-content-muted">ALL CLEAR. NO PENDING ENTITIES.</div>
            ) : (
              stats.recentPendingJobs?.map(job => (
                <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base transition-colors">
                  <div>
                    <h4 className="text-lg font-bold tracking-tight uppercase">{job.title}</h4>
                    <p className="text-xs font-semibold uppercase tracking-widest text-content-muted mt-2">
                      {job.recruiter.companyName} <span className="mx-2">/</span> {new Date(job.createdAt).toLocaleDateString()}
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
    </div>
  );
}
