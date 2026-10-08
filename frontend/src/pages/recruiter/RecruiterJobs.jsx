import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Search, Plus, Filter, ChevronDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/recruiter/jobs');
      setJobs(response.data.jobs);
    } catch (err) {
      setError('Failed to retrieve job postings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading job postings..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  const filteredJobs = jobs
    .filter(job => {
      if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!job.title.toLowerCase().includes(q) && !(job.description && job.description.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'NEWEST') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'OLDEST') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">JOBS</div>
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">Job Postings</h1>
          <p className="text-sm font-medium text-content-muted">Manage your job postings and applicant pipelines.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="shrink-0">
          <Button variant="primary" className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Create Job
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by job title or keywords..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border-light rounded-md text-navy placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 text-sm font-medium text-navy bg-surface border border-border-light rounded-md hover:bg-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            className="px-4 py-2 text-sm font-medium text-navy bg-surface border border-border-light rounded-md hover:bg-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="NEWEST">Sort by Newest</option>
            <option value="OLDEST">Sort by Oldest</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-base rounded-full flex items-center justify-center mx-auto mb-4 border border-border-light shadow-sm">
            <BriefcaseBusiness className="w-8 h-8 text-content-muted" />
          </div>
          <h3 className="text-lg font-bold text-navy mb-2">No job postings yet</h3>
          <p className="text-sm text-content-muted mb-6">Create your first opportunity to begin recruiting.</p>
          <Link to="/recruiter/jobs/new">
            <Button variant="outline" className="text-primary border-border-light hover:bg-primary/5 hover:border-primary/40">
              Create Job
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-base/50">
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-center">Applicants</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
              {filteredJobs.map(job => (
                <TableRow key={job.id} className="hover:bg-base/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-base border border-border-light rounded-lg flex items-center justify-center shrink-0 shadow-sm font-bold text-navy">
                        {job.company?.name?.[0] || 'C'}
                      </div>
                      <div>
                        <div className="font-bold text-navy">{job.title}</div>
                        <div className="text-xs font-medium text-content-muted mt-0.5">
                          {job.company?.name || 'Company'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-sm font-medium text-content-muted">
                    {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center px-2 py-1 bg-base border border-border-light rounded-md text-xs font-bold text-navy min-w-[2rem]">
                      {job._count?.applications || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link to={`/recruiter/jobs/${job.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-semibold">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
