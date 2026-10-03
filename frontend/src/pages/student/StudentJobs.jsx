import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Search, MapPin, BriefcaseBusiness, IndianRupee, Eye, SlidersHorizontal, User } from 'lucide-react';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/student/jobs');
      setJobs(response.data.jobs);
      setError(null);
    } catch (err) {
      setError('Failed to load opportunities. System error.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="LOADING OPPORTUNITIES..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.recruiter.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter ? job.jobType === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">OPPORTUNITIES</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Discover and apply for open positions matched to your profile.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-6 border border-border-light bg-surface">
        <div className="flex-1">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Search roles or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Job Types' },
              { value: 'FULL_TIME', label: 'Full Time' },
              { value: 'INTERNSHIP', label: 'Internship' }
            ]}
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="NO RESULTS FOUND"
          description="Adjust your search parameters to find opportunities."
          actionText="Clear Filters"
          onAction={() => { setSearchQuery(''); setTypeFilter(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="border border-border-light bg-surface hover:border-inverted transition-colors group flex flex-col md:flex-row">

              {/* Avatar & Title Area */}
              <div className="p-8 md:w-[40%] border-b md:border-b-0 md:border-r border-border-light flex gap-8 items-start">
                <div className="w-16 h-16 bg-inverted flex items-center justify-center font-bold text-content-inverted text-2xl shrink-0">
                  {job.recruiter.companyName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-content-muted mt-3">
                    {job.recruiter.companyName}
                  </p>
                </div>
              </div>

              {/* Metadata Area */}
              <div className="p-8 md:w-[35%] flex flex-col justify-center border-b md:border-b-0 md:border-r border-border-light">
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

              {/* Action Area */}
              <div className="p-8 md:w-[25%] flex flex-col justify-between items-start md:items-end bg-base group-hover:bg-inverted group-hover:text-inverted transition-colors">
                <div className="mb-6 md:mb-0 text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted group-hover:text-content-inverted-muted mb-2">Required CGPA</p>
                  <p className="text-xl font-bold tracking-tighter group-hover:text-accent">{job.cgpaRequired || 'N/A'}</p>
                </div>

                <Link to={`/student/jobs/${job.id}`} className="w-full">
                  <Button variant="inverted" className="w-full group-hover:bg-accent group-hover:text-inverted">
                    VIEW DETAILS
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
