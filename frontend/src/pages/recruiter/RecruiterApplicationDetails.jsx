import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { ArrowLeft, User, ExternalLink, MessageSquare, Briefcase, History } from 'lucide-react';

export default function RecruiterApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

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
      setError('Failed to load application telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.patch(`/recruiter/applications/${id}`, { status, notes });
      await fetchDetails();
      alert('Pipeline status updated.');
    } catch (err) {
      alert('Failed to update pipeline status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING CANDIDATE TELEMETRY..." />;
  if (error) return <ErrorState message={error} />;

  const { student, job, statusHistory } = application;

  return (
    <div className="space-y-12">
      <Link to={`/recruiter/jobs/${job.id}/applications`}>
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Pipeline
        </Button>
      </Link>

      {/* Hero Header */}
      <div className="border border-border-strong bg-inverted text-content-inverted p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-lines-dark opacity-30 pointer-events-none mix-blend-overlay z-0"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent flex items-center justify-center font-bold text-inverted text-2xl shrink-0">
              {student.user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{student.fullName || student.user.email}</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {job.title}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-content-inverted-muted">Current Pipeline Status</span>
            <StatusBadge status={application.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="w-5 h-5" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Full Name</p>
                  <p className="text-lg font-bold tracking-tight uppercase">{student.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Email Identity</p>
                  <p className="text-lg font-bold tracking-tight uppercase truncate">{student.user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Department</p>
                  <p className="text-lg font-bold tracking-tight uppercase">{student.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">CGPA</p>
                  <p className="text-lg font-bold tracking-tight uppercase">{student.cgpa || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Graduation</p>
                  <p className="text-lg font-bold tracking-tight uppercase">{student.graduationYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Phone</p>
                  <p className="text-lg font-bold tracking-tight uppercase">{student.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border-light">
                <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-4">Resume / CV</p>
                {student.resumeUrl ? (
                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="inverted" icon={<ExternalLink className="w-4 h-4" />}>
                      ACCESS RESUME
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm font-semibold uppercase tracking-widest text-status-warning">NO RESUME PROVIDED</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                Pipeline Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <Select
                label="Pipeline Status Transition"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'APPLIED', label: 'APPLIED' },
                  { value: 'UNDER_REVIEW', label: 'UNDER REVIEW' },
                  { value: 'SHORTLISTED', label: 'SHORTLISTED' },
                  { value: 'INTERVIEW', label: 'INTERVIEW' },
                  { value: 'SELECTED', label: 'SELECTED' },
                  { value: 'REJECTED', label: 'REJECTED' }
                ]}
              />

              <Textarea
                label="Evaluation Notes (Internal)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Record interview notes or evaluation metrics..."
              />

              <Button onClick={handleUpdate} loading={updating} variant="inverted" className="w-full">
                COMMIT PIPELINE UPDATE
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-border-light">
                {statusHistory?.map((history, idx) => (
                  <div key={history.id} className="relative flex items-center justify-between group pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-inverted bg-base flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 bg-inverted rounded-full" />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-tight">{history.newStatus}</div>
                      <time className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-1 block">
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
