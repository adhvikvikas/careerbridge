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
    <div className="space-y-12">
      <Link to="/recruiter/jobs">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
          Return to Pipeline
        </Button>
      </Link>

      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">{job.title}</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">APPLICANT PIPELINE</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="NO APPLICANTS YET"
          description="The pipeline for this opportunity is currently empty."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate Profile</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-inverted text-inverted flex items-center justify-center font-bold">
                      {app.student.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold tracking-tight uppercase">{app.student.fullName || app.student.user.email}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-1">
                        {app.student.department} / CGPA: {app.student.cgpa}
                      </div>
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
                  <Link to={`/recruiter/applications/${app.id}`}>
                    <Button variant="outline-inverted" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
                      INSPECT
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
