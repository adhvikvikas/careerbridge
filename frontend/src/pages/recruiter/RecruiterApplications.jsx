import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { FileText, ArrowLeft, ChevronRight, Users, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';

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

  if (loading) return <LoadingState message="Loading applicants..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <Link to="/recruiter/jobs" className="inline-flex items-center text-sm font-semibold text-content-muted hover:text-navy transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">APPLICANTS</div>
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">{job.title}</h1>
          <p className="text-sm font-medium text-content-muted">
            {job.company?.name || 'Company'} &bull; Review and manage candidates for this role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 flex items-center gap-4 border-border-light">
          <div className="w-12 h-12 border border-border-light text-content-muted rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-0.5">Total</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{applications.length}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-border-light">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-0.5">Under Review</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{applications.filter(a => a.status === 'UNDER_REVIEW').length}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-border-light">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-0.5">Shortlisted</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{applications.filter(a => a.status === 'SHORTLISTED').length}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-border-light">
          <div className="w-12 h-12 bg-status-success/10 text-status-success rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-0.5">Selected</p>
            <h3 className="text-2xl font-bold text-navy leading-none">{applications.filter(a => a.status === 'SELECTED').length}</h3>
          </div>
        </Card>
      </div>

      {applications.length === 0 ? (
        <Card className="p-12 text-center border-border-light">
          <div className="w-16 h-16 bg-base rounded-full flex items-center justify-center mx-auto mb-4 border border-border-light shadow-sm">
            <FileText className="w-8 h-8 text-content-muted" />
          </div>
          <h3 className="text-lg font-bold text-navy mb-2">No applicants yet</h3>
          <p className="text-sm text-content-muted mb-6">The pipeline for this opportunity is currently empty.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border-light">
          <Table>
            <TableHeader className="bg-base/50">
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
              {applications.map(app => (
                <TableRow key={app.id} className="hover:bg-base/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-base border border-border-light rounded-full flex items-center justify-center shadow-sm font-bold text-navy">
                        {app.student.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-navy">{app.student.user.email.split('@')[0]}</div>
                        <div className="text-xs font-medium text-content-muted mt-0.5 flex items-center gap-2">
                          <span>{app.student.branch || 'Unknown Branch'}</span>
                          <span className="w-1 h-1 rounded-full bg-border-light"></span>
                          <span>CGPA: {app.student.cgpa || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-content-muted">
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link to={`/recruiter/applications/${app.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-semibold">
                        Review <ChevronRight className="w-3 h-3 ml-1" />
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
