import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { BriefcaseBusiness, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/admin/jobs?status=${statusFilter}` : '/admin/jobs';
      const response = await api.get(url);
      setJobs(response.data.jobs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/jobs/${id}/approve`);
      await fetchJobs();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.message?.includes('Company must be approved')) {
        alert('This job cannot be approved until the company is approved.');
      } else {
        alert(err.response?.data?.message || 'Failed to approve job');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedJobId(id);
    setRejectionReason('');
    setModalError(null);
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (rejectionReason.length < 5 || rejectionReason.length > 500) {
      setModalError('Reason must be between 5 and 500 characters.');
      return;
    }
    setActionLoading(true);
    setModalError(null);
    try {
      await api.patch(`/admin/jobs/${selectedJobId}/reject`, {
        reason: rejectionReason
      });
      setIsRejectModalOpen(false);
      await fetchJobs();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && jobs.length === 0) return <LoadingState message="RETRIEVING OPPORTUNITIES..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">OPPORTUNITY REGISTRY</h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Govern and verify all institutional job postings.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-surface border border-border-light rounded-lg p-1">
            {['', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${
                  statusFilter === status ? 'bg-primary text-white' : 'text-content-muted hover:text-content hover:bg-base'
                }`}
              >
                {status || 'ALL'}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-64">
            <Input
              icon={<Search className="w-5 h-5" />}
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness className="w-10 h-10" />}
          title="NO OPPORTUNITIES FOUND"
          description="There are currently no job postings matching your criteria."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity Identity</TableHead>
              <TableHead>Corporate Entity</TableHead>
              <TableHead>Authorization Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map(job => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-bold tracking-tight uppercase text-content">{job.title}</div>
                  <div className="text-xs text-content-muted mt-1">Min CGPA: {job.minCgpa || 'N/A'} • Openings: {job.openings || 'TBD'}</div>
                  <div className="text-[10px] text-content-muted uppercase tracking-widest mt-1">Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-semibold text-content uppercase">{job.company?.name}</div>
                  <div className="text-xs text-content-muted mt-1">Company Status: {job.company?.status}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-2">
                    <StatusBadge status={job.status} />
                    {job.status === 'REJECTED' && job.rejectionReason && (
                      <span className="text-[10px] font-medium text-status-danger max-w-[200px] truncate" title={job.rejectionReason}>
                        Reason: {job.rejectionReason}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {job.status === 'PENDING' && (
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRejectModal(job.id)}
                        disabled={actionLoading}
                        className="text-status-danger border-status-danger/20 hover:bg-status-danger/10"
                      >
                        REJECT
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleApprove(job.id)}
                        disabled={actionLoading}
                      >
                        APPROVE
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => !actionLoading && setIsRejectModalOpen(false)}
        title="Reject Opportunity"
      >
        <div className="space-y-6">
          {modalError && (
            <div className="p-3 bg-status-danger/10 text-status-danger text-sm font-medium rounded-lg">
              {modalError}
            </div>
          )}
          <Textarea
            label="Rejection Reason"
            placeholder="Provide a clear reason for rejecting this opportunity (5-500 chars)..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (modalError) setModalError(null);
            }}
            rows={4}
            required
          />
          <div className="flex justify-end gap-4 pt-4 border-t border-border-light">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} disabled={actionLoading}>
              CANCEL
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
              CONFIRM REJECTION
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
