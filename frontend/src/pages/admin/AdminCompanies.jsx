import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { Building2, Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/admin/companies?status=${statusFilter}` : '/admin/companies';
      const response = await api.get(url);
      setCompanies(response.data.companies);
      setError(null);
    } catch (err) {
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${id}/approve`);
      await fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve company');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedCompanyId(id);
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
      await api.patch(`/admin/companies/${selectedCompanyId}/reject`, {
        reason: rejectionReason
      });
      setIsRejectModalOpen(false);
      await fetchCompanies();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject company');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && companies.length === 0) return <LoadingState message="RETRIEVING REGISTRY..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCompanies} />;

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.recruiter?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.recruiter?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">COMPANY REGISTRY</h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Govern platform access and verify corporate entities.</p>
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
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-10 h-10" />}
          title="NO COMPANIES FOUND"
          description="There are currently no companies matching your criteria."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity Details</TableHead>
              <TableHead>Recruiter Contact</TableHead>
              <TableHead>Authorization Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map(company => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="font-bold tracking-tight uppercase text-content">{company.name}</div>
                  <div className="text-xs text-content-muted mt-1">{company.industry} • {company.location}</div>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                      {company.website}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-semibold text-content uppercase">{company.recruiter?.name}</div>
                  <div className="text-xs text-content-muted mt-1">{company.recruiter?.user?.email}</div>
                  <div className="text-xs text-content-muted mt-0.5">{company.recruiter?.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-2">
                    <StatusBadge status={company.status} />
                    {company.status === 'REJECTED' && company.rejectionReason && (
                      <span className="text-[10px] font-medium text-status-danger max-w-[200px] truncate" title={company.rejectionReason}>
                        Reason: {company.rejectionReason}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {company.status === 'PENDING' && (
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRejectModal(company.id)}
                        disabled={actionLoading}
                        className="text-status-danger border-status-danger/20 hover:bg-status-danger/10"
                      >
                        REJECT
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleApprove(company.id)}
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
        title="Reject Company"
      >
        <div className="space-y-6">
          {modalError && (
            <div className="p-3 bg-status-danger/10 text-status-danger text-sm font-medium rounded-lg">
              {modalError}
            </div>
          )}
          <Textarea
            label="Rejection Reason"
            placeholder="Provide a clear reason for rejecting this entity (5-500 chars)..."
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
