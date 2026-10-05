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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-6 border-b border-border-light flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Job Postings</h1>
          <p className="text-sm font-medium text-content-muted">Manage your opportunities and track applicant pipelines.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button variant="primary">
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness className="w-10 h-10" />}
          title="No Opportunities Posted"
          description="You haven't posted any jobs yet. Create your first posting to start receiving applications."
          actionText="Post Opportunity"
          onAction={() => window.location.href = '/recruiter/jobs/new'}
        />
      ) : (
        <div className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-base/50">
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
              {jobs.map(job => (
                <TableRow key={job.id} className="hover:bg-base/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-content">{job.title}</div>
                    {job.status === 'REJECTED' && job.rejectionReason && (
                      <div className="text-xs font-medium text-status-danger mt-1">
                        Reason: {job.rejectionReason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-content-muted">{job.jobType.replace('_', ' ')}</div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-content-muted">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-content">
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
                        <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4" />}>
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/recruiter/jobs/${job.id}/applications`}>
                        <Button variant="secondary" size="sm">
                          View Applicants
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
