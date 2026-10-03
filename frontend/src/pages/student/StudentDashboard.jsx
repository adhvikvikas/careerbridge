import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/student/dashboard-stats');
        setStats(response.data.stats);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="INITIALIZING DASHBOARD..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-16">

      {/* Hero Header */}
      <div className="bg-inverted text-content-inverted p-12 lg:p-24 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-12 border border-border-dark">
        <div className="absolute inset-0 grid-lines-dark opacity-40 pointer-events-none mix-blend-overlay z-0"></div>
        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-6 border-l-2 border-accent pl-3">
            System Initialization Complete
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-6">
            WELCOME BACK,<br/>
            <span className="text-content-inverted-muted">{stats.studentName || user.email.split('@')[0]}</span>
          </h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-inverted-muted max-w-md">
            Review your application telemetry and explore new opportunities.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link to="/student/jobs">
            <Button variant="accent" size="lg">
              DISCOVER OPPORTUNITIES <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted mb-6">Application Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border-light bg-surface">
          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Applications Submitted</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.totalApplications}</h3>
          </div>

          <div className="p-8 border-b lg:border-b-0 lg:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Shortlisted Status</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.shortlisted}</h3>
          </div>

          <div className="p-8 border-b sm:border-b-0 sm:border-r border-border-light hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Interviews Scheduled</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.interviews}</h3>
          </div>

          <div className="p-8 hover:bg-base transition-colors group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-8 group-hover:text-inverted transition-colors">Saved Opportunities</p>
            <h3 className="text-5xl font-bold tracking-tighter">{stats.savedJobs}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs font-bold uppercase tracking-widest text-inverted hover:underline">
              View All
            </Link>
          </div>
          <div className="border border-border-light bg-surface divide-y divide-border-light">
            {stats.recentApplications?.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-content-muted">No applications submitted yet.</div>
            ) : (
              stats.recentApplications?.map(app => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base transition-colors">
                  <div>
                    <h4 className="text-lg font-bold tracking-tight uppercase">{app.job.title}</h4>
                    <p className="text-xs font-semibold uppercase tracking-widest text-content-muted mt-2">
                      {app.job.recruiter.companyName} <span className="mx-2">/</span> {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-content-muted">System Notifications</h3>
            <Link to="/student/notifications" className="text-xs font-bold uppercase tracking-widest text-inverted hover:underline">
              View All
            </Link>
          </div>
          <div className="border border-border-light bg-surface divide-y divide-border-light">
            {stats.recentNotifications?.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-content-muted">No recent notifications.</div>
            ) : (
              stats.recentNotifications?.map(notif => (
                <div key={notif.id} className={`p-6 flex gap-6 transition-colors ${!notif.isRead ? 'bg-inverted text-content-inverted' : 'hover:bg-base'}`}>
                  <div className="shrink-0 mt-1">
                    {notif.isRead ? (
                      <div className="w-2 h-2 rounded-full border border-content-muted" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-widest ${!notif.isRead ? 'text-content-inverted' : 'text-content'}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-sm mt-3 ${!notif.isRead ? 'text-content-inverted-muted' : 'text-content-muted'}`}>
                      {notif.message}
                    </p>
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
