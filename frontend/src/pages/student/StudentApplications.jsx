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
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">APPLICATION TELEMETRY</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Track the status of your transmitted applications.</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="NO APPLICATIONS TRANSMITTED"
          description="You haven't applied to any opportunities yet."
          actionText="DISCOVER OPPORTUNITIES"
          onAction={() => window.location.href = '/student/jobs'}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity</TableHead>
              <TableHead>Transmitted Date</TableHead>
              <TableHead>Pipeline Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-inverted text-inverted flex items-center justify-center font-bold">
                      {app.job.recruiter.companyName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold tracking-tight uppercase">{app.job.title}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-1">{app.job.recruiter.companyName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold tracking-widest text-content-muted uppercase">
                  {new Date(app.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/student/applications/${app.id}`}>
                    <Button variant="outline-inverted" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
                      INSPECT TIMELINE
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
