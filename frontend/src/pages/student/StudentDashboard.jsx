import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { 
  FileText, 
  Users, 
  User,
  Trophy, 
  Bookmark, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Briefcase 
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { profile } = useOutletContext() || {};
  
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api('/student/dashboard-stats'),
          api('/student/jobs')
        ]);
        
        setStats(statsRes.stats);
        setNotifications(statsRes.recentNotifications || []);
        
        // Take top 3 jobs as "Recommended"
        if (jobsRes.success && jobsRes.jobs) {
          setRecommendedJobs(jobsRes.jobs.slice(0, 3));
        }
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSaveJob = async (jobId, isCurrentlySaved) => {
    try {
      if (isCurrentlySaved) {
        await api(`/student/jobs/${jobId}/save`, { method: 'DELETE' });
      } else {
        await api(`/student/jobs/${jobId}/save`, { method: 'POST' });
      }
      // Optimistically update the UI
      setRecommendedJobs(jobs => jobs.map(j => 
        j.id === jobId ? { ...j, isSaved: !isCurrentlySaved } : j
      ));
    } catch (err) {
      console.error('Failed to toggle save state', err);
    }
  };

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;

  const { applications } = stats;
  const appliedCount = Math.max(0, applications.total - (applications.underReview + applications.shortlisted + applications.selected + applications.rejected));

  // Profile readiness calculation
  const profileFields = [
    { key: 'name', label: 'Basic Information' },
    { key: 'branch', label: 'Branch / Department' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'graduationYear', label: 'Graduation Year' },
    { key: 'backlogs', label: 'Backlogs Status' },
    { key: 'resumeUrl', label: 'Resume Uploaded' },
  ];
  const completedFields = profileFields.filter(f => profile && profile[f.key] !== null && profile[f.key] !== undefined && profile[f.key] !== '');
  const missingFields = profileFields.filter(f => !profile || profile[f.key] === null || profile[f.key] === undefined || profile[f.key] === '');
  const profileProgress = Math.round((completedFields.length / profileFields.length) * 100) || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Student Dashboard</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-2">
            Good morning, {profile?.name || user?.email?.split('@')[0] || 'Student'}
          </h1>
          <p className="text-content-muted">Here's what's happening with your placement journey.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#B76E4C]/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-content-muted mb-1">Total Applications</div>
            <div className="text-2xl font-bold text-navy">{applications.total}</div>
          </div>
        </Card>
        <Card className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-content-muted mb-1">Shortlisted</div>
            <div className="text-2xl font-bold text-navy">{applications.shortlisted}</div>
          </div>
        </Card>
        <Card className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-content-muted mb-1">Selected</div>
            <div className="text-2xl font-bold text-navy">{applications.selected}</div>
          </div>
        </Card>
        <Card className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-content-muted mb-1">Saved Jobs</div>
            <div className="text-2xl font-bold text-navy">{stats.savedJobsCount}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recommended Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  <span className="text-primary text-xl">★</span> Recommended for You
                </h3>
                <p className="text-sm text-content-muted">Based on your profile and eligibility</p>
              </div>
              <Link to="/student/jobs" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                Browse all jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recommendedJobs.length === 0 ? (
                <div className="text-sm text-content-muted text-center py-8">No opportunities currently available.</div>
              ) : (
                recommendedJobs.map(job => (
                  <div key={job.id} className="p-4 border border-border-light rounded-xl flex gap-4 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center shrink-0 border border-border-light text-navy font-bold text-lg">
                      {job.company?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-navy truncate pr-4">{job.title}</h4>
                        <button 
                          onClick={() => handleSaveJob(job.id, job.isSaved)}
                          className="text-content-muted hover:text-primary transition-colors mt-0.5"
                        >
                          <Bookmark className={`w-5 h-5 ${job.isSaved ? 'fill-primary text-primary' : ''}`} />
                        </button>
                      </div>
                      <div className="text-sm text-content-muted mb-3 flex items-center gap-2">
                        <span>{job.company?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-border-light" />
                        <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5" /> {job.company?.location || 'India'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                          {job.departments?.includes('CSE') ? 'Tech' : 'Core'}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-50 text-content-muted rounded text-xs font-medium border border-border-light flex items-center gap-1">
                          Min CGPA: {job.minCgpa || 'N/A'}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-50 text-content-muted rounded text-xs font-medium border border-border-light">
                          {job.graduationYears?.join(', ') || 'Any'} Batch
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 border-t border-border-light pt-3">
                        <div className="text-xs text-content-muted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                        <Link to={`/student/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs text-navy border-border-light">
                            View Job &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile Readiness
                </h3>
                <p className="text-sm text-content-muted">Keep your profile up to date to get better job recommendations.</p>
              </div>
              <Link to="/student/profile" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                Complete profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between text-sm font-bold text-navy mb-2">
                  <span>Completion</span>
                  <span>{profileProgress}%</span>
                </div>
                <div className="h-2 w-full bg-base rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Completed</h4>
                  {completedFields.length === 0 ? (
                    <div className="text-sm text-content-muted">None</div>
                  ) : (
                    <ul className="space-y-1.5">
                      {completedFields.map(field => (
                        <li key={field.key} className="flex items-center gap-2 text-sm text-navy">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {field.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">Missing</h4>
                  {missingFields.length === 0 ? (
                    <div className="text-sm text-content-muted">None</div>
                  ) : (
                    <ul className="space-y-1.5">
                      {missingFields.map(field => (
                        <li key={field.key} className="flex items-center gap-2 text-sm text-content-muted">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-border-light ml-0.5" />
                          {field.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Application Snapshot */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Application Snapshot
              </h3>
            </div>
            <p className="text-sm text-content-muted mb-6">Track the status of your applications</p>
            
            <div className="space-y-4">
              {[
                { label: 'Applied', count: appliedCount, color: 'bg-primary' },
                { label: 'Under Review', count: applications.underReview, color: 'bg-blue-500' },
                { label: 'Shortlisted', count: applications.shortlisted, color: 'bg-green-500' },
                { label: 'Selected', count: applications.selected, color: 'bg-emerald-600' },
                { label: 'Rejected', count: applications.rejected, color: 'bg-red-500' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${stat.color}`} />
                  <div className="w-28 text-sm text-navy">{stat.label}</div>
                  <div className="flex-1 h-2 bg-base rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${stat.color}`} 
                      style={{ width: applications.total > 0 ? `${(stat.count / applications.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-medium text-navy">{stat.count}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <Link to="/student/applications" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center justify-end gap-1">
                View applications <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Latest Updates */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Latest Updates
              </h3>
            </div>
            <p className="text-sm text-content-muted mb-6">Recent activity and important updates</p>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-sm text-content-muted py-4">No recent updates.</div>
              ) : (
                notifications.slice(0, 3).map(notif => (
                  <div key={notif.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-base flex items-center justify-center shrink-0 border border-border-light text-primary">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pb-4 border-b border-border-light last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-navy pr-2">{notif.title}</h4>
                        {!notif.readAt && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-content-muted mb-2 line-clamp-2">{notif.message}</p>
                      <div className="text-[11px] text-content-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-right">
              <Link to="/student/notifications" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center justify-end gap-1">
                View all notifications <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
