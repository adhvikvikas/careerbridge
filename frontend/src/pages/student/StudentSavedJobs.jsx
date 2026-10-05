import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, BriefcaseBusiness, IndianRupee } from 'lucide-react';

export default function StudentSavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/student/saved-jobs');
      setSavedJobs(response.data.savedJobs);
      setError(null);
    } catch (err) {
      setError('Failed to load bookmarked opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (id) => {
    try {
      await api.delete(`/student/saved-jobs/${id}`);
      fetchSavedJobs();
    } catch (err) {
      alert('Failed to remove bookmark.');
    }
  };

  if (loading) return <LoadingState message="RETRIEVING BOOKMARKS..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSavedJobs} />;

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-light">
        <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Saved Opportunities</h1>
        <p className="text-sm font-medium text-content-muted">Opportunities you have bookmarked for future application.</p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title="No Bookmarks Found"
          description="You haven't saved any opportunities yet."
          actionText="Discover Opportunities"
          onAction={() => window.location.href = '/student/jobs'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedJobs.map(item => {
            const job = item.job;
            return (
              <div key={item.id} className="border border-border-light rounded-2xl bg-surface hover:border-primary/30 transition-colors flex flex-col h-full overflow-hidden shadow-sm">
                <div className="p-6 flex-1">
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                      {job.recruiter.companyName[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-content leading-tight hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm font-medium text-content-muted mt-1 truncate">
                        {job.recruiter.companyName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-content-muted">
                      <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-content-muted">
                      <BriefcaseBusiness className="w-4 h-4 shrink-0" /> {job.jobType.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-content-muted">
                      <IndianRupee className="w-4 h-4 shrink-0" /> <span className="truncate">{job.salary || 'Not disclosed'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-border-light bg-base/50 p-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => removeSavedJob(job.id)}
                    className="w-1/2 text-status-danger border-status-danger/30 hover:bg-status-danger/10"
                  >
                    Remove
                  </Button>
                  <Link to={`/student/jobs/${job.id}`} className="w-1/2">
                    <Button variant="secondary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
