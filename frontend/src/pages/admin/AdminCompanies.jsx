import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { Building2, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/admin/companies');
      setCompanies(response.data.companies);
    } catch (err) {
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${id}/status`, { status: 'APPROVED' });
      await fetchCompanies();
    } catch (err) {
      alert('Failed to approve company');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedCompanyId(id);
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
      await api.patch(`/admin/companies/${selectedCompanyId}/status`, {
        status: 'REJECTED',
        reason: rejectionReason
      });
      setIsRejectModalOpen(false);
      await fetchCompanies();
    } catch (err) {
      alert('Failed to reject company');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING REGISTRY..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCompanies} />;

  const filteredCompanies = companies.filter(c =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">COMPANY REGISTRY</h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Govern platform access and verify corporate entities.</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-10 h-10" />}
          title="NO COMPANIES FOUND"
          description="There are currently no companies matching your query."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity Identity</TableHead>
              <TableHead>Recruiter Access</TableHead>
              <TableHead>Registered Date</TableHead>
              <TableHead>Authorization Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map(company => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="font-bold tracking-tight uppercase">{company.companyName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold tracking-widest text-content-muted uppercase">{company.user.email}</div>
                </TableCell>
                <TableCell className="text-xs font-semibold tracking-widest text-content-muted uppercase">
                  {new Date(company.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={company.status} />
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
                        AUTHORIZE
                      </Button>
                    </div>
                  )}
                  {company.status === 'REJECTED' && (
                    <Button
                      variant="outline-inverted"
                      size="sm"
                      onClick={() => handleApprove(company.id)}
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
        title="Reject Company"
      >
        <div className="space-y-6">
          <Textarea
            label="Rejection Reason"
            placeholder="Provide a clear reason for rejecting this entity..."
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
