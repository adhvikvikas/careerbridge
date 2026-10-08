import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { ArrowLeft, User, ExternalLink, MessageSquare, Briefcase, History, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecruiterApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/recruiter/applications/${id}`);
      setApplication(response.data.application);
      setStatus(response.data.application.status);
      setNotes(response.data.application.recruiterNotes || '');
    } catch (err) {
      setError('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    setMessage(null);
    try {
      await api.patch(`/recruiter/applications/${id}/status`, { status });
      await fetchDetails();
      setMessage({ type: 'success', text: 'Application status updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update application status.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateNotes = async () => {
    setUpdatingNotes(true);
    setMessage(null);
    try {
      await api.patch(`/recruiter/applications/${id}/notes`, { notes });
      await fetchDetails();
      setMessage({ type: 'success', text: 'Internal notes saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save notes.' });
    } finally {
      setUpdatingNotes(false);
    }
  };

  if (loading) return <LoadingState message="Loading candidate profile..." />;
  if (error) return <ErrorState message={error} />;

  const { student, job, statusHistory } = application;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <Link to={`/recruiter/jobs/${job.id}/applications`} className="inline-flex items-center text-sm font-semibold text-content-muted hover:text-navy transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Applicants
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">APPLICATION PROFILE</div>
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">{student?.name || student?.user?.name || student?.user?.email?.split('@')[0] || 'Unknown Candidate'}</h1>
          <p className="text-sm font-medium text-content-muted">
            Reviewing application for <strong>{job.title}</strong> at <strong>{job.company?.name || 'Company'}</strong>
          </p>
          <p className="text-xs text-content-muted mt-1">
            Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs font-bold text-content-muted uppercase tracking-wider">Status:</span>
          <StatusBadge status={application.status} />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success/20 text-status-success' : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border-light">
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3 text-navy">
                <User className="w-5 h-5 text-primary" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">Email Address</p>
                  <p className="text-base font-bold text-navy">{student.user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">Department / Branch</p>
                  <p className="text-base font-bold text-navy">{student.branch || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">CGPA</p>
                  <p className="text-base font-bold text-navy">{student.cgpa || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">Graduation Year</p>
                  <p className="text-base font-bold text-navy">{student.graduationYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">Active Backlogs</p>
                  <p className="text-base font-bold text-navy">{student.backlogs ?? 0}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border-light">
                <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">Resume / CV</p>
                {student.resumeUrl ? (
                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />} className="text-primary border-primary/20 hover:bg-primary/5">
                      View Resume
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm font-medium text-status-warning flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> No resume provided by candidate.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border-light">
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3 text-navy">
                <MessageSquare className="w-5 h-5 text-primary" />
                Evaluation & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div>
                <Select
                  label="Update Pipeline Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'APPLIED', label: 'Applied' },
                    { value: 'UNDER_REVIEW', label: 'Under Review' },
                    { value: 'SHORTLISTED', label: 'Shortlisted' },
                    { value: 'INTERVIEW', label: 'Interview' },
                    { value: 'SELECTED', label: 'Selected' },
                    { value: 'REJECTED', label: 'Rejected' }
                  ]}
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleUpdateStatus} loading={updatingStatus} variant="primary" className="shadow-sm">
                    Update Status
                  </Button>
                </div>
              </div>
              
              <div className="pt-8 border-t border-border-light">
                <Textarea
                  label="Internal Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Record interview notes or evaluation metrics (visible only to recruiters)..."
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleUpdateNotes} loading={updatingNotes} variant="outline" className="border-border-light">
                    Save Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border-light">
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3 text-navy">
                <History className="w-5 h-5 text-primary" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {statusHistory && statusHistory.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-border-light">
                  {statusHistory.map((history, idx) => (
                    <div key={history.id || idx} className="relative flex items-center justify-between group pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-primary bg-surface flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy">{history.newStatus.replace('_', ' ')}</div>
                        <time className="text-xs font-medium text-content-muted mt-0.5 block">
                          {history.changedAt ? new Date(history.changedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date unavailable'}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-content-muted text-center py-4 bg-surface/50 rounded-lg">
                  No timeline history found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
