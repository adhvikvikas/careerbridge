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

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/admin/jobs');
      setJobs(response.data.jobs);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/jobs/${id}/status`, { status: 'APPROVED' });
      await fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve job');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedJobId(id);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/jobs/${selectedJobId}/status`, {
        status: 'REJECTED',
        reason: rejectionReason
      });
      setIsRejectModalOpen(false);
      await fetchJobs();
    } catch (err) {
      alert('Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING OPPORTUNITIES..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.recruiter.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">OPPORTUNITY REGISTRY</h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Govern and verify all institutional job postings.</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness className="w-10 h-10" />}
          title="NO OPPORTUNITIES FOUND"
          description="There are currently no job postings matching your query."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity Identity</TableHead>
              <TableHead>Corporate Entity</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Authorization Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map(job => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-bold tracking-tight uppercase">{job.title}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold tracking-widest text-content-muted uppercase">{job.recruiter.companyName}</div>
                </TableCell>
                <TableCell className="text-xs font-semibold tracking-widest text-content-muted uppercase">
                  {new Date(job.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
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
                        AUTHORIZE
                      </Button>
                    </div>
                  )}
                  {job.status === 'REJECTED' && (
                    <Button
                      variant="outline-inverted"
                      size="sm"
                      onClick={() => handleApprove(job.id)}
                      disabled={actionLoading}
                    >
                      OVERRIDE: AUTHORIZE
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Opportunity"
      >
        <div className="space-y-6">
          <Textarea
            label="Rejection Reason"
            placeholder="Provide a clear reason for rejecting this opportunity..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-4 pt-4 border-t border-border-light">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
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
