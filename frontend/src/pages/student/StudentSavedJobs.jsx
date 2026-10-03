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
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">BOOKMARKED OPPORTUNITIES</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Opportunities you have saved for future application.</p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title="NO BOOKMARKS DETECTED"
          description="You haven't saved any opportunities yet. Explore the pipeline."
          actionText="DISCOVER OPPORTUNITIES"
          onAction={() => window.location.href = '/student/jobs'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {savedJobs.map(item => {
            const job = item.job;
            return (
              <div key={item.id} className="border border-border-light bg-surface hover:border-inverted transition-colors group flex flex-col h-full">
                <div className="p-8 flex-1">
                  <div className="flex gap-6 items-start mb-8">
                    <div className="w-12 h-12 bg-inverted text-inverted flex items-center justify-center font-bold text-xl shrink-0">
                      {job.recruiter.companyName[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-2 truncate">
                        {job.recruiter.companyName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-content">
                      <MapPin className="w-4 h-4 text-content-muted" /> <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-content">
                      <BriefcaseBusiness className="w-4 h-4 text-content-muted" /> {job.jobType}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-content">
                      <IndianRupee className="w-4 h-4 text-content-muted" /> <span className="truncate">{job.salary || 'Not disclosed'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-border-light">
                  <Button
                    variant="ghost"
                    onClick={() => removeSavedJob(job.id)}
                    className="w-1/2 rounded-none border-r border-border-light text-status-danger hover:text-status-danger hover:bg-status-danger/10"
                  >
                    REMOVE
                  </Button>
                  <Link to={`/student/jobs/${job.id}`} className="w-1/2">
                    <Button variant="inverted" className="w-full rounded-none group-hover:bg-accent group-hover:text-inverted">
                      INSPECT
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
