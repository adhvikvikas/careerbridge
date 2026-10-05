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
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-light">
        <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Opportunities</h1>
        <p className="text-sm font-medium text-content-muted">Discover and apply for open positions matched to your profile.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={<Search className="w-4 h-4" />}
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
              { value: 'INTERNSHIP', label: 'Internship' },
              { value: 'PART_TIME', label: 'Part Time' },
              { value: 'CONTRACT', label: 'Contract' }
            ]}
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="No Results Found"
          description="Adjust your search parameters to find opportunities."
          actionText="Clear Filters"
          onAction={() => { setSearchQuery(''); setTypeFilter(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <Card key={job.id} className="flex flex-col hover:border-primary/30 transition-colors h-full">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                    {job.recruiter.companyName[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-content leading-tight group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm font-medium text-content-muted mt-1">
                      {job.recruiter.companyName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 mt-auto">
                  <div className="flex items-center gap-2 text-sm font-medium text-content">
                    <MapPin className="w-4 h-4 text-content-muted shrink-0" /> 
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-content">
                    <BriefcaseBusiness className="w-4 h-4 text-content-muted shrink-0" /> 
                    {job.jobType.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-content">
                    <IndianRupee className="w-4 h-4 text-content-muted shrink-0" /> 
                    <span className="truncate">{job.salary || 'Not disclosed'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-content">
                    <User className="w-4 h-4 text-content-muted shrink-0" /> 
                    <span className="truncate">CGPA: {job.cgpaRequired || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-base/50 border-t border-border-light flex justify-end">
                <Link to={`/student/jobs/${job.id}`}>
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
