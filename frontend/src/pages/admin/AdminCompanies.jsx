import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Building2, Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router-dom';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  if (loading && companies.length === 0) return <LoadingState message="RETRIEVING REGISTRY..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCompanies} />;

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.recruiter?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.recruiter?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
            COMPANIES
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">Company Registry</h1>
          <p className="text-content-muted text-base max-w-2xl">
            Review and govern organizations participating in the CareerBridge platform.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border-light pb-4">
        <div className="flex items-center gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                statusFilter === status 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-content-muted hover:text-navy hover:bg-base'
              }`}
            >
              {status ? status.charAt(0) + status.slice(1).toLowerCase() : 'All'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input
            icon={<Search className="w-4 h-4 text-content-muted" />}
            placeholder="Search companies by name, recruiter or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-10 h-10" />}
            title="No Companies Found"
            description="There are currently no companies matching your criteria."
          />
        ) : (
          <Table>
            <TableHeader className="bg-base border-b border-border-light">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-content-muted">Company Name</TableHead>
                <TableHead className="font-semibold text-content-muted">Industry</TableHead>
                <TableHead className="font-semibold text-content-muted">Location</TableHead>
                <TableHead className="font-semibold text-content-muted">Recruiter</TableHead>
                <TableHead className="font-semibold text-content-muted">Status</TableHead>
                <TableHead className="text-right font-semibold text-content-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
            {filteredCompanies.map(company => (
              <TableRow key={company.id} className="hover:bg-base/50 transition-colors group">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-base border border-border-light flex items-center justify-center shrink-0">
                      <span className="font-bold text-navy text-lg">{company.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-bold text-navy">{company.name}</div>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-0.5 block truncate max-w-[150px]">
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm text-content-muted">{company.industry || '—'}</TableCell>
                <TableCell className="py-4 text-sm text-content-muted max-w-[150px] truncate">{company.location || '—'}</TableCell>
                <TableCell className="py-4">
                  <div className="text-sm font-bold text-navy">{company.recruiter?.name}</div>
                  <div className="text-xs text-content-muted mt-0.5">{company.recruiter?.user?.email}</div>
                  <div className="text-xs text-content-muted mt-0.5">{company.recruiter?.phone}</div>
                </TableCell>
                <TableCell className="py-4">
                  <StatusBadge status={company.status} size="sm" />
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Link to={`/admin/companies/${company.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold px-4"
                    >
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
        <div className="p-4 border-t border-border-light text-xs text-content-muted flex items-center justify-between bg-base/30">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>
      </div>

    </div>
  );
}
