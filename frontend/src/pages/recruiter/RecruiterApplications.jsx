import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { FileText, ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function RecruiterApplications() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get(`/recruiter/jobs/${id}/applications`);
        setJob(response.data.job);
        setApplications(response.data.applications);
      } catch (err) {
        setError('Failed to retrieve applicant pipeline.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [id]);

  if (loading) return <LoadingState message="RETRIEVING APPLICANT PIPELINE..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to="/recruiter/jobs">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
          Return to Jobs
        </Button>
      </Link>

      <div className="pb-6 border-b border-border-light">
        <h1 className="text-3xl font-bold tracking-tight text-content mb-2">{job.title}</h1>
        <p className="text-sm font-medium text-content-muted">Applicant Pipeline</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No Applicants Yet"
          description="The pipeline for this opportunity is currently empty."
        />
      ) : (
        <div className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-base/50">
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
              {applications.map(app => (
                <TableRow key={app.id} className="hover:bg-base/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-lg">
                        {app.student.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-content">{app.student.user.email.split('@')[0]}</div>
                        <div className="text-xs font-medium text-content-muted mt-1">
                          {app.student.branch || 'Unknown Branch'} &bull; CGPA: {app.student.cgpa || 'N/A'}
                        </div>
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
                    <Link to={`/recruiter/applications/${app.id}`}>
                      <Button variant="secondary" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
                        Review
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
