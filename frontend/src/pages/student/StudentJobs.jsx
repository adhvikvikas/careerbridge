import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar, Bookmark, RotateCcw } from 'lucide-react';

export default function StudentJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    department: '',
    jobType: '', // NOTE: jobType is not strictly in Prisma schema in this repo, so we won't filter on it backend, maybe client side or ignore
    minCgpa: '',
    location: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filters.department, filters.minCgpa, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // We pass department and minCgpa if they exist
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.minCgpa) params.append('minCgpa', filters.minCgpa);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api(`/student/jobs?${params.toString()}`);
      if (response.success) {
        setJobs(response.jobs);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId, isCurrentlySaved) => {
    try {
      if (isCurrentlySaved) {
        await api(`/student/jobs/${jobId}/save`, { method: 'DELETE' });
      } else {
        await api(`/student/jobs/${jobId}/save`, { method: 'POST' });
      }
      // Optimistically update the UI
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, isSaved: !isCurrentlySaved } : j
      ));
    } catch (err) {
      console.error('Failed to toggle save state', err);
    }
  };

  const handleApply = async (jobId, isEligible) => {
    if (!isEligible) {
      alert('You are not eligible for this role based on your profile.');
      return;
    }
    navigate(`/student/jobs/${jobId}`);
  };

  const resetFilters = () => {
    setFilters({ department: '', jobType: '', minCgpa: '', location: '' });
    if (searchQuery) {
      navigate('/student/jobs');
    }
  };

  const filteredJobs = jobs.filter(job => {
    // Client-side fallback filtering for things not supported by current API easily
    if (filters.location && job.company?.location !== filters.location) return false;
    return true;
  });

  const uniqueLocations = [...new Set(jobs.map(j => j.company?.location).filter(Boolean))];
  const uniqueDepartments = [...new Set(jobs.flatMap(j => j.departments || []))];

  if (loading && jobs.length === 0) return <LoadingState message="Loading opportunities..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Opportunities</div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-2">
          {searchQuery ? `Search Results: "${searchQuery}"` : 'Browse Opportunities'}
        </h1>
        <p className="text-content-muted">Find your next step. Explore jobs from top companies.</p>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border-light rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <select 
          className="border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-base focus:ring-1 focus:ring-primary outline-none"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">All Departments</option>
          {uniqueDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
        </select>

        <select 
          className="border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-base focus:ring-1 focus:ring-primary outline-none"
          value={filters.minCgpa}
          onChange={(e) => setFilters({ ...filters, minCgpa: e.target.value })}
        >
          <option value="">Min. CGPA</option>
          <option value="6.0">6.0+</option>
          <option value="7.0">7.0+</option>
          <option value="8.0">8.0+</option>
          <option value="9.0">9.0+</option>
        </select>

        <select 
          className="border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-base focus:ring-1 focus:ring-primary outline-none"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option value="">All Locations</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>

        <button 
          onClick={resetFilters}
          className="ml-auto text-sm font-medium text-content-muted hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-content-muted font-medium">
        <div>{filteredJobs.length} opportunities found</div>
        <div className="flex items-center gap-2">
          Sort by <span className="text-navy font-bold">Newest First</span>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="No Opportunities Found"
          description="Try adjusting your filters or checking back later."
          actionText="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <Card key={job.id} className="p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors">
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
                      onClick={() => handleSaveJob(job.id, job.isSaved)}
                      className="text-content-muted hover:text-primary transition-colors"
                    >
                      <Bookmark className={`w-5 h-5 ${job.isSaved ? 'fill-primary text-primary' : ''}`} />
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
                    {job.hasApplied ? (
                      <Button variant="outline" disabled className="bg-gray-100 text-gray-500 border-gray-200">
                        Applied
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        onClick={() => handleApply(job.id, job.isEligible)}
                        className={!job.isEligible ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        Apply &rarr;
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
