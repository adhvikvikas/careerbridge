import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight } from 'lucide-react';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/student/applications');
      setApplications(response.data.applications);
      setError(null);
    } catch (err) {
      setError('Failed to load application telemetry.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING APPLICATION LOGS..." />;
  if (error) return <ErrorState message={error} onRetry={fetchApplications} />;

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border-light">
        <h1 className="text-3xl font-bold tracking-tight text-content mb-2">My Applications</h1>
        <p className="text-sm font-medium text-content-muted">Track the status of your submitted applications.</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No Applications Found"
          description="You haven't applied to any opportunities yet."
          actionText="Discover Opportunities"
          onAction={() => window.location.href = '/student/jobs'}
        />
      ) : (
        <div className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Pipeline Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map(app => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                        {app.job.recruiter.companyName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-content hover:text-primary transition-colors">
                          <Link to={`/student/applications/${app.id}`}>{app.job.title}</Link>
                        </div>
                        <div className="text-xs font-medium text-content-muted mt-0.5">{app.job.recruiter.companyName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-content-muted">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/student/applications/${app.id}`}>
                      <Button variant="secondary" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
                        View Details
                      </Button>
                    </Link>
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
