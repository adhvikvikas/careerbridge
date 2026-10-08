import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Edit2, Users, Building2, Briefcase, Calendar, GraduationCap, XCircle, Archive, AlertTriangle } from 'lucide-react';

export default function RecruiterJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/recruiter/jobs/${id}`);
      setJob(response.data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    const hasApplicants = job._count?.applications > 0;
    const warning = hasApplicants 
      ? `This job has existing applications. The job will be archived and applicant history will be preserved.` 
      : `Are you sure you want to remove "${job.title}" from your active job postings?`;
      
    if (window.confirm(`Delete Job?\n\n${warning}\n\nActions:\nCancel\nArchive Job`)) {
      try {
        await api.delete(`/recruiter/jobs/${id}`);
        navigate('/recruiter/jobs');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to archive job');
      }
    }
  };

  if (loading) return <LoadingState message="Loading job details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobDetails} />;
  if (!job) return <ErrorState message="Job not found" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-content-muted mb-4">
        <Link to="/recruiter/jobs" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">{job.title}</h1>
          <div className="flex items-center gap-4 text-sm text-content-muted">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" /> {job.company?.name || 'Company'}
            </span>
            <span className="flex items-center gap-1">
              {job.deletedAt ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-content-muted/10 text-content-muted uppercase tracking-wider">
                  <Archive className="w-3.5 h-3.5" /> Archived
                </span>
              ) : (
                <StatusBadge status={job.status} size="sm" />
              )}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {!job.deletedAt && (
            <>
              <Button variant="outline" onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit Job
              </Button>
              <Button variant="outline" className="border-status-danger/30 text-status-danger hover:bg-status-danger/10" onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" /> Delete Job
              </Button>
            </>
          )}
          <Button variant="primary" onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}>
            <Users className="w-4 h-4 mr-2" /> View Applicants ({job._count?.applications || 0})
          </Button>
        </div>
      </div>

      {job.status === 'REJECTED' && job.rejectionReason && !job.deletedAt && (
        <div className="p-4 rounded-xl border bg-status-danger/10 border-status-danger/20 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-status-danger">Job Rejected</h3>
            <p className="text-sm mt-1 text-content-muted">{job.rejectionReason}</p>
          </div>
        </div>
      )}
      
      {job.status === 'APPROVED' && !job.deletedAt && (
        <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Editing an approved job will reset its status to pending and require re-approval by an administrator.
          </p>
        </div>
      )}

      {job.deletedAt && (
        <div className="p-4 rounded-xl border border-content-muted/30 bg-base flex items-start gap-3">
          <Archive className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-navy">Archived Job</h3>
            <p className="text-sm mt-1 text-content-muted">
              This job has been archived and is no longer visible to applicants. Applicant history is preserved.
            </p>
          </div>
        </div>
      )}

      <Card className="p-6 md:p-8 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 border-b border-border-light pb-2">Job Description</h2>
          <div className="prose prose-sm max-w-none text-content-muted whitespace-pre-wrap">
            {job.description || 'No description provided.'}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-4 border-b border-border-light pb-2">Details & Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-base border border-border-light flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Openings</p>
                <p className="font-semibold text-navy">{job.openings}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-base border border-border-light flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Application Deadline</p>
                <p className="font-semibold text-navy">
                  {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-base border border-border-light flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Minimum CGPA</p>
                <p className="font-semibold text-navy">{job.minCgpa}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-base border border-border-light flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Eligible Graduation Years</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.graduationYears?.map(year => (
                    <span key={year} className="px-2 py-1 bg-surface border border-border-light rounded-md text-xs font-medium text-navy">
                      {year}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-navy mb-4 border-b border-border-light pb-2">Eligible Departments</h2>
          <div className="flex flex-wrap gap-2">
            {job.departments?.map(dept => (
              <span key={dept} className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                {dept}
              </span>
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
}
