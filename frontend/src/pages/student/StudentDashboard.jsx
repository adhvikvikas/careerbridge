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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-surface p-8 md:p-12 rounded-2xl shadow-sm border border-border-light flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="text-xs font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            System Online
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-content mb-3">
            Welcome back, {stats.studentName || user.email.split('@')[0]}
          </h1>
          <p className="text-sm font-medium text-content-muted max-w-lg">
            Review your application telemetry and discover new opportunities matched to your profile.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link to="/student/jobs">
            <Button variant="primary" size="lg">
              Discover Opportunities <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Application Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Applications Submitted</p>
            <h3 className="text-4xl font-bold text-content">{stats.totalApplications}</h3>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Shortlisted Status</p>
            <h3 className="text-4xl font-bold text-content">{stats.shortlisted}</h3>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Interviews Scheduled</p>
            <h3 className="text-4xl font-bold text-content">{stats.interviews}</h3>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-content-muted mb-2">Saved Opportunities</p>
            <h3 className="text-4xl font-bold text-content">{stats.savedJobs}</h3>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border-light px-6 py-4 bg-base/50">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Link to="/student/applications" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border-light">
            {stats.recentApplications?.length === 0 ? (
              <div className="p-8 text-center text-sm text-content-muted">No applications submitted yet.</div>
            ) : (
              stats.recentApplications?.map(app => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base/50 transition-colors">
                  <div>
                    <h4 className="text-base font-bold text-content">{app.job.title}</h4>
                    <p className="text-sm text-content-muted mt-1 font-medium">
                      {app.job.recruiter.companyName} &bull; {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border-light px-6 py-4 bg-base/50">
            <CardTitle className="text-base">System Notifications</CardTitle>
            <Link to="/student/notifications" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border-light">
            {stats.recentNotifications?.length === 0 ? (
              <div className="p-8 text-center text-sm text-content-muted">No recent notifications.</div>
            ) : (
              stats.recentNotifications?.map(notif => (
                <div key={notif.id} className={`p-6 flex gap-4 transition-colors ${!notif.isRead ? 'bg-primary/5' : 'hover:bg-base/50'}`}>
                  <div className="shrink-0 mt-1">
                    {notif.isRead ? (
                      <div className="w-2 h-2 rounded-full border border-content-muted" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-content' : 'text-content-muted'}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-sm mt-1 ${!notif.isRead ? 'text-content' : 'text-content-muted'}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
