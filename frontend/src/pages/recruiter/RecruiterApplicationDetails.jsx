import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { ArrowLeft, User, ExternalLink, MessageSquare, Briefcase, History, CheckSquare, AlertTriangle } from 'lucide-react';

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
      setNotes(response.data.application.notes || '');
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
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update application status.' });
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
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save notes.' });
    } finally {
      setUpdatingNotes(false);
    }
  };

  if (loading) return <LoadingState message="LOADING CANDIDATE PROFILE..." />;
  if (error) return <ErrorState message={error} />;

  const { student, job, statusHistory } = application;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Link to={`/recruiter/jobs/${job.id}/applications`}>
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
          Return to Applicants
        </Button>
      </Link>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success/20 text-status-success' : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckSquare className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface border border-border-light rounded-2xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0">
            {student.user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-content mb-2">{student.user.email.split('@')[0]}</h1>
            <p className="text-sm font-medium text-content-muted flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Applied for {job.title}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 relative z-10 shrink-0">
          <span className="text-xs font-semibold text-content-muted uppercase tracking-wider">Current Status</span>
          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3">
                <User className="w-5 h-5 text-content-muted" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Email Address</p>
                  <p className="text-base font-bold text-content">{student.user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Department / Branch</p>
                  <p className="text-base font-bold text-content">{student.branch || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">CGPA</p>
                  <p className="text-base font-bold text-content">{student.cgpa || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Graduation Year</p>
                  <p className="text-base font-bold text-content">{student.graduationYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Active Backlogs</p>
                  <p className="text-base font-bold text-content">{student.backlogs ?? 0}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border-light">
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4">Resume / CV</p>
                {student.resumeUrl ? (
                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
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

          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-content-muted" />
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
                  <Button onClick={handleUpdateStatus} loading={updatingStatus} variant="primary">
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
                  <Button onClick={handleUpdateNotes} loading={updatingNotes} variant="secondary">
                    Save Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3">
                <History className="w-5 h-5 text-content-muted" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-border-light">
                {statusHistory?.map((history, idx) => (
                  <div key={history.id} className="relative flex items-center justify-between group pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-primary bg-surface flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-content">{history.newStatus.replace('_', ' ')}</div>
                      <time className="text-xs font-medium text-content-muted mt-1 block">
                        {new Date(history.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
