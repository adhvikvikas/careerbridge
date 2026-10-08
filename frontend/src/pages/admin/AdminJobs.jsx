import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/admin/jobs?status=${statusFilter}` : '/admin/jobs';
      const response = await api.get(url);
      setJobs(response.data.jobs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading && jobs.length === 0) return <LoadingState message="RETRIEVING OPPORTUNITIES..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
            JOBS
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">Opportunity Registry</h1>
          <p className="text-content-muted text-base max-w-2xl">
            Review and govern job postings before they become visible to students.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border-light pb-4">
        <div className="flex items-center gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                statusFilter === status 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-content-muted hover:text-navy hover:bg-base'
              }`}
            >
              {status ? status.charAt(0) + status.slice(1).toLowerCase() : 'All'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input
            icon={<Search className="w-4 h-4 text-content-muted" />}
            placeholder="Search jobs by title, company or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness className="w-10 h-10" />}
            title="No Opportunities Found"
            description="There are currently no job postings matching your criteria."
          />
        ) : (
          <Table>
            <TableHeader className="bg-base border-b border-border-light">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-content-muted">Job Title</TableHead>
                <TableHead className="font-semibold text-content-muted">Company</TableHead>
                <TableHead className="font-semibold text-content-muted">Min CGPA</TableHead>
                <TableHead className="font-semibold text-content-muted">Openings</TableHead>
                <TableHead className="font-semibold text-content-muted">Deadline</TableHead>
                <TableHead className="font-semibold text-content-muted">Status</TableHead>
                <TableHead className="text-right font-semibold text-content-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
              {filteredJobs.map(job => (
                <TableRow key={job.id} className="hover:bg-base/50 transition-colors group">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-base border border-border-light flex items-center justify-center shrink-0">
                      <span className="font-bold text-navy text-lg">{job.company?.name ? job.company.name.charAt(0).toUpperCase() : 'J'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-navy truncate max-w-[200px]" title={job.title}>{job.title}</div>
                      <div className="text-xs text-content-muted mt-0.5 truncate max-w-[200px]" title={job.company?.name}>{job.company?.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm text-content-muted">{job.company?.name || '—'}</TableCell>
                <TableCell className="py-4 text-sm text-content-muted">{job.minCgpa ? job.minCgpa.toFixed(1) : '—'}</TableCell>
                <TableCell className="py-4 text-sm text-content-muted">{job.openings || '—'}</TableCell>
                <TableCell className="py-4 text-sm text-content-muted">{new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                <TableCell className="py-4">
                  <StatusBadge status={job.status} size="sm" />
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Link to={`/admin/jobs/${job.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold px-4"
                    >
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
        <div className="p-4 border-t border-border-light text-xs text-content-muted flex items-center justify-between bg-base/30">
          Showing {filteredJobs.length} of {jobs.length} opportunities
        </div>
      </div>

    </div>
  );
}
