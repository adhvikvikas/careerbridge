import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function AdminJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalError, setModalError] = useState(null);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/jobs/${id}`);
      setJob(response.data.job);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Job not found');
      } else {
        setError('Failed to load job details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/admin/audit-logs?targetId=${id}&targetType=JOB`);
      setLogs(response.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  useEffect(() => {
    fetchJob();
    fetchLogs();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/jobs/${id}/approve`);
      await fetchJob();
      await fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.length < 5 || rejectionReason.length > 500) {
      setModalError('Reason must be between 5 and 500 characters.');
      return;
    }
    setActionLoading(true);
    setModalError(null);
    try {
      await api.patch(`/admin/jobs/${id}/reject`, {
        reason: rejectionReason
      });
      setIsRejectModalOpen(false);
      await fetchJob();
      await fetchLogs();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading job details..." />;
  if (error === 'Job not found') return (
    <div className="max-w-4xl mx-auto py-8">
      <EmptyState 
        icon={<Briefcase className="w-10 h-10" />}
        title="Job not found"
        description="The requested job could not be found."
        actionText="Back to Jobs"
        onAction={() => navigate('/admin/jobs')}
      />
    </div>
  );
  if (error || !job) return <ErrorState message={error || 'Not found'} onRetry={fetchJob} />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Link to="/admin/jobs" className="inline-flex items-center text-sm font-semibold text-content-muted hover:text-navy transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border-light">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">{job.title}</h1>
          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-content-muted" />
            <span className="text-sm font-medium text-content-muted">Opportunity</span>
            <span className="text-border-light">•</span>
            <StatusBadge status={job.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-navy mb-4">Job Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-navy whitespace-pre-wrap">{job.description || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Openings</p>
              <p className="font-semibold text-navy">{job.openings || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Deadline</p>
              <p className="font-semibold text-navy">{job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-light">
          <h2 className="text-lg font-bold text-navy mb-4">Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Minimum CGPA</p>
              <p className="font-semibold text-navy">{job.minCgpa ? job.minCgpa.toFixed(1) : '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Graduation Years</p>
              <p className="font-semibold text-navy">
                {job.graduationYears?.length > 0 ? job.graduationYears.join(', ') : '—'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Departments</p>
              <p className="font-semibold text-navy">
                {job.departments?.length > 0 ? job.departments.join(', ') : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Created</p>
              <p className="font-semibold text-navy">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-light">
          <h2 className="text-lg font-bold text-navy mb-4">Company</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Company Name</p>
              <Link to={`/admin/companies/${job.company?.id}`} className="font-semibold text-primary hover:underline">
                {job.company?.name || '—'}
              </Link>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Company Status</p>
              <StatusBadge status={job.company?.status} size="sm" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-light">
          <h2 className="text-lg font-bold text-navy mb-4">Governance</h2>
          <div className="bg-base p-4 rounded-xl border border-border-light">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-content-muted">Current Status:</span>
              <StatusBadge status={job.status} size="sm" />
            </div>
            {job.status === 'REJECTED' && job.rejectionReason && (
              <div className="mt-4 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg">
                <p className="text-xs font-bold text-status-danger uppercase tracking-wider mb-1">Rejection/Suspension Reason</p>
                <p className="text-sm text-status-danger">{job.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-border-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy">Applicants</h2>
            <StatusBadge status={`${job.applications?.length || 0} applicants`} size="sm" />
          </div>
          
          {!job.applications || job.applications.length === 0 ? (
            <div className="p-4 bg-base rounded-xl border border-border-light text-center">
              <p className="text-sm text-content-muted">No applications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-base border-y border-border-light text-xs uppercase font-semibold text-content-muted">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">CGPA / Grad</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {job.applications.map(app => (
                    <tr key={app.id} className="hover:bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-navy">{app.student?.name || app.student?.user?.name || app.student?.user?.email?.split('@')[0] || 'Unknown Candidate'}</div>
                        <div className="text-xs text-content-muted mt-0.5">{app.student?.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-navy">{app.student?.branch || '—'}</td>
                      <td className="px-4 py-3 text-navy">
                        {app.student?.cgpa ? app.student.cgpa.toFixed(1) : '—'} / {app.student?.graduationYear || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right text-content-muted text-xs">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-border-light">
          <h2 className="text-lg font-bold text-navy mb-4">Audit History</h2>
          {logs.length === 0 ? (
            <div className="p-4 bg-base rounded-xl border border-border-light text-center">
              <p className="text-sm text-content-muted">No governance history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="p-4 bg-base rounded-xl border border-border-light">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-navy">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-content-muted">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-content-muted mb-2">By: {log.admin?.email || 'Admin'}</p>
                  {log.reason && (
                    <div className="mt-2 p-3 bg-white border border-border-light rounded-lg">
                      <p className="text-xs font-bold text-navy uppercase tracking-wider mb-1">Reason</p>
                      <p className="text-sm text-navy">{log.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {job.status === 'PENDING' && (
          <div className="pt-6 border-t border-border-light">
            {job.company?.status !== 'APPROVED' ? (
              <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                <p className="text-sm font-bold text-status-warning mb-1">Company approval required</p>
                <p className="text-sm text-status-warning/80">This opportunity cannot be approved until its company has been approved.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="border-status-danger/30 text-status-danger hover:bg-status-danger/10"
                  onClick={() => {
                    setRejectionReason('');
                    setModalError(null);
                    setIsRejectModalOpen(true);
                  }}
                  disabled={actionLoading}
                >
                  Reject Job
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleApprove}
                  disabled={actionLoading}
                  loading={actionLoading}
                >
                  Approve Job
                </Button>
              </div>
            )}
          </div>
        )}

        {job.status === 'APPROVED' && (
          <div className="pt-6 border-t border-border-light flex justify-end">
            <Button 
              variant="outline" 
              className="border-status-danger/30 text-status-danger hover:bg-status-danger/10"
              onClick={() => {
                setRejectionReason('');
                setModalError(null);
                setIsRejectModalOpen(true);
              }}
              disabled={actionLoading}
            >
              Suspend Job
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => !actionLoading && setIsRejectModalOpen(false)}
        title={job.status === 'APPROVED' ? 'Suspend Job' : 'Reject Job'}
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-sm text-content-muted">
            {job.status === 'APPROVED' ? 'Please provide a reason for suspending this job posting.' : 'Please provide a reason for rejecting this job posting.'}
          </p>
          {modalError && (
            <div className="p-3 bg-status-danger/10 text-status-danger text-sm font-medium rounded-lg">
              {modalError}
            </div>
          )}
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (modalError) setModalError(null);
            }}
            rows={4}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" className="bg-status-danger border-status-danger hover:bg-status-danger/90" onClick={handleReject} loading={actionLoading}>
              {job.status === 'APPROVED' ? 'Suspend Job' : 'Reject Job'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
