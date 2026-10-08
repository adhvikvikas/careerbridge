import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Calendar, Search } from 'lucide-react';

export default function StudentSavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await api('/student/saved-jobs');
      if (response.success) {
        setSavedJobs(response.savedJobs);
      }
    } catch (err) {
      setError('Failed to load bookmarked opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      await api(`/student/jobs/${jobId}/save`, { method: 'DELETE' });
      // Optimistically remove from list
      setSavedJobs(prev => prev.filter(item => item.jobId !== jobId));
    } catch (err) {
      alert('Failed to remove bookmark.');
    }
  };

  if (loading) return <LoadingState message="Loading Saved Jobs..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSavedJobs} />;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Saved Jobs</div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-2">
          Your Saved Opportunities
        </h1>
        <p className="text-content-muted">Keep track of the jobs you're interested in.</p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title="No saved opportunities yet"
          description="You haven't bookmarked any jobs. Browse available opportunities and save them for later."
          actionText="Browse Jobs"
          onAction={() => window.location.href = '/student/jobs'}
        />
      ) : (
        <div className="space-y-4">
          {savedJobs.map(item => {
            const job = item.job;
            return (
              <Card key={item.id} className="p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors">
                <div className="w-16 h-16 bg-base rounded-xl flex items-center justify-center shrink-0 border border-border-light text-navy font-bold text-2xl">
                  {job.company?.name?.charAt(0) || 'C'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-1">{job.title}</h3>
                      <div className="text-sm text-content-muted flex items-center gap-2">
                        <span>{job.company?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-border-light" />
                        <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5" /> {job.company?.location || 'Location Not Specified'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => removeSavedJob(job.id)}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        <Bookmark className="w-5 h-5 fill-primary" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 mt-3">
                    {job.departments?.length > 0 && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100">
                        {job.departments.join(', ')}
                      </span>
                    )}
                    {job.graduationYears?.length > 0 && (
                      <span className="px-2.5 py-1 bg-gray-50 text-content-muted rounded-md text-xs font-semibold border border-border-light">
                        {job.graduationYears.join(', ')} Batch
                      </span>
                    )}
                    {job.minCgpa && (
                      <span className="px-2.5 py-1 bg-gray-50 text-content-muted rounded-md text-xs font-semibold border border-border-light">
                        Min. CGPA: {job.minCgpa}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border-light pt-4">
                    <div className="text-sm text-content-muted flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Deadline: <span className="font-semibold text-navy">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link to={`/student/jobs/${job.id}`}>
                        <Button variant="outline" className="border-border-light text-navy font-semibold hover:bg-base">
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/student/jobs/${job.id}`}>
                        <Button variant="primary">
                          Apply &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
