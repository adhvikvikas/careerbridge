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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-border-light bg-surface mb-8">
          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-inverted transition-colors">Pending Companies</p>
              <StatusBadge status="PENDING" />
            </div>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.companies.pending}</h3>
          </div>

          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-inverted transition-colors">Approved Companies</p>
              <StatusBadge status="APPROVED" />
            </div>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.companies.approved}</h3>
          </div>

          <div className="p-8 border-border-light hover:bg-base transition-colors group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-inverted transition-colors">Rejected Companies</p>
              <StatusBadge status="REJECTED" />
            </div>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.companies.rejected}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-border-light bg-surface">
          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-inverted transition-colors">Pending Jobs</p>
              <StatusBadge status="PENDING" />
            </div>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.jobs.pending}</h3>
          </div>

          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-inverted transition-colors">Approved Jobs</p>
              <StatusBadge status="APPROVED" />
            </div>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.jobs.approved}</h3>
          </div>

          <div className="p-8 border-border-light hover:bg-base transition-colors group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-inverted transition-colors">Rejected Jobs</p>
              <StatusBadge status="REJECTED" />
            </div>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.jobs.rejected}</h3>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/admin/companies">
          <Button variant="primary">Manage Companies <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </Link>
        <Link to="/admin/jobs">
          <Button variant="outline">Manage Jobs <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </Link>
      </div>
    </div>
  );
}
