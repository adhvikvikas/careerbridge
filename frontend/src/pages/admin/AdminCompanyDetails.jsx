import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';

export default function AdminCompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalError, setModalError] = useState(null);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/companies/${id}`);
      setCompany(response.data.company);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Company not found');
      } else {
        setError('Failed to load company details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/admin/audit-logs?targetId=${id}&targetType=COMPANY`);
      setLogs(response.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchLogs();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${id}/approve`);
      await fetchCompany();
      await fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve company');
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
      await api.patch(`/admin/companies/${id}/reject`, {
        reason: rejectionReason
      });
      setIsRejectModalOpen(false);
      await fetchCompany();
      await fetchLogs();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject company');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading company details..." />;
  if (error === 'Company not found') return (
    <div className="max-w-4xl mx-auto py-8">
      <EmptyState 
        icon={<Building2Icon />}
        title="Company not found"
        description="The requested company could not be found."
        actionText="Back to Companies"
        onAction={() => navigate('/admin/companies')}
      />
    </div>
  );
  if (error || !company) return <ErrorState message={error || 'Not found'} onRetry={fetchCompany} />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Link to="/admin/companies" className="inline-flex items-center text-sm font-semibold text-content-muted hover:text-navy transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Companies
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border-light">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">{company.name}</h1>
          <div className="flex items-center gap-3">
            <Building2Icon />
            <span className="text-sm font-medium text-content-muted">Company</span>
            <span className="text-border-light">•</span>
            <StatusBadge status={company.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-navy mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Company Name</p>
              <p className="font-semibold text-navy">{company.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Industry</p>
              <p className="font-semibold text-navy">{company.industry || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Location</p>
              <p className="font-semibold text-navy">{company.location || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Website</p>
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold truncate block">
                  {company.website}
                </a>
              ) : <p className="font-semibold text-navy">—</p>}
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-navy whitespace-pre-wrap">{company.description || '—'}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-light">
          <h2 className="text-lg font-bold text-navy mb-4">Recruiter Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Name</p>
              <p className="font-semibold text-navy">{company.recruiter?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Email</p>
              <p className="font-semibold text-navy">{company.recruiter?.user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Phone</p>
              <p className="font-semibold text-navy">{company.recruiter?.phone || '—'}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-light">
          <h2 className="text-lg font-bold text-navy mb-4">Governance</h2>
          <div className="bg-base p-4 rounded-xl border border-border-light">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-content-muted">Current Status:</span>
              <StatusBadge status={company.status} size="sm" />
            </div>
            {company.status === 'REJECTED' && company.rejectionReason && (
              <div className="mt-4 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg">
                <p className="text-xs font-bold text-status-danger uppercase tracking-wider mb-1">Rejection/Suspension Reason</p>
                <p className="text-sm text-status-danger">{company.rejectionReason}</p>
              </div>
            )}
          </div>
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

        {company.status === 'PENDING' && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border-light">
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
              Reject Company
            </Button>
            <Button 
              variant="primary" 
              onClick={handleApprove}
              disabled={actionLoading}
              loading={actionLoading}
            >
              Approve Company
            </Button>
          </div>
        )}

        {company.status === 'APPROVED' && (
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
              Suspend Company
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => !actionLoading && setIsRejectModalOpen(false)}
        title={company.status === 'APPROVED' ? 'Suspend Company' : 'Reject Company'}
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-sm text-content-muted">
            {company.status === 'APPROVED' ? 'Please provide a reason for suspending this company registration.' : 'Please provide a reason for rejecting this company registration.'}
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
              {company.status === 'APPROVED' ? 'Suspend Company' : 'Reject Company'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const Building2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v8"/>
    <path d="M18 14h2a2 2 0 0 1 2 2v6"/>
    <path d="M10 22V10h4v12"/>
    <path d="M10 6h4"/>
  </svg>
);
