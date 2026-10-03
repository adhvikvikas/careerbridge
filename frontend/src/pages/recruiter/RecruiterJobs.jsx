import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Users, Edit } from 'lucide-react';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/recruiter/jobs');
      setJobs(response.data.jobs);
    } catch (err) {
      setError('Failed to retrieve opportunities pipeline.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING OPPORTUNITIES PIPELINE..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">OPPORTUNITIES PIPELINE</h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Manage your organization's job postings and application funnels.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button variant="accent">
            INITIALIZE NEW OPPORTUNITY
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness className="w-10 h-10" />}
          title="NO OPPORTUNITIES IN PIPELINE"
          description="You haven't posted any jobs yet. Create your first posting to start receiving applications."
          actionText="INITIALIZE OPPORTUNITY"
          onAction={() => window.location.href = '/recruiter/jobs/new'}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity Identity</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-bold tracking-tight uppercase">{job.title}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold tracking-widest text-content-muted uppercase">{job.jobType}</div>
                </TableCell>
                <TableCell className="text-xs font-semibold tracking-widest text-content-muted uppercase">
                  {new Date(job.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-bold tracking-tight">
                    <Users className="w-4 h-4 text-content-muted" />
                    {job._count?.applications || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <Link to={`/recruiter/jobs/${job.id}/edit`}>
                      <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>
                        MODIFY
                      </Button>
                    </Link>
                    <Link to={`/recruiter/jobs/${job.id}/applications`}>
                      <Button variant="inverted" size="sm">
                        VIEW PIPELINE
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
