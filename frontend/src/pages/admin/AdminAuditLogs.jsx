import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { FileText, Search, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/admin/audit-logs');
        setLogs(response.data.logs);
      } catch (err) {
        setError('Failed to load audit telemetry.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading && logs.length === 0) return <LoadingState message="Loading audit logs..." />;
  if (error) return <ErrorState message={error} />;

  const filteredLogs = logs.filter(log => {
    if (filterType === 'COMPANY' && log.targetType !== 'COMPANY') return false;
    if (filterType === 'JOB' && log.targetType !== 'JOB') return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.action.toLowerCase().includes(q) || 
             log.admin?.email?.toLowerCase().includes(q) ||
             log.targetId.toLowerCase().includes(q) ||
             (log.reason && log.reason.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
            GOVERNANCE
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">System Audit Logs</h1>
          <p className="text-content-muted text-base max-w-2xl">
            A record of administrative actions performed across the CareerBridge platform.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border-light pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              filterType === 'ALL' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-content-muted hover:text-navy hover:bg-base'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('COMPANY')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              filterType === 'COMPANY' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-content-muted hover:text-navy hover:bg-base'
            }`}
          >
            Company Actions
          </button>
          <button
            onClick={() => setFilterType('JOB')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              filterType === 'JOB' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-content-muted hover:text-navy hover:bg-base'
            }`}
          >
            Job Actions
          </button>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-base border border-border-light rounded-lg text-sm text-content-muted">
            <Clock className="w-4 h-4" />
            <span>All Time</span>
          </div>
          <div className="w-full sm:w-72">
            <Input
              icon={<Search className="w-4 h-4 text-content-muted" />}
              placeholder="Search logs by action, target or admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" />}
            title="No administrative activity yet"
            description="Approval and rejection actions will appear here once governance activity begins."
          />
        ) : (
          <Table>
            <TableHeader className="bg-base border-b border-border-light">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-content-muted">Action</TableHead>
                <TableHead className="font-semibold text-content-muted">Target</TableHead>
                <TableHead className="font-semibold text-content-muted">Target Type</TableHead>
                <TableHead className="font-semibold text-content-muted">Performed By</TableHead>
                <TableHead className="font-semibold text-content-muted">Reason</TableHead>
                <TableHead className="text-right font-semibold text-content-muted">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border-light">
              {filteredLogs.map(log => (
                <TableRow key={log.id} className="hover:bg-base/50 transition-colors">
                  <TableCell className="py-4">
                    <Badge variant={
                      log.action.includes('REJECT') ? 'danger' :
                      log.action.includes('APPROVE') ? 'success' : 'default'
                    } size="sm">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-semibold text-navy max-w-[150px] truncate block" title={log.targetId}>
                      ID: {log.targetId.substring(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-content-muted capitalize">
                    {log.targetType.toLowerCase()}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm font-bold text-navy">Admin</div>
                    <div className="text-xs text-content-muted mt-0.5">{log.admin?.email}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    {log.reason ? (
                      <div className="text-sm text-content-muted max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </div>
                    ) : (
                      <span className="text-content-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-right text-sm text-content-muted">
                    {new Date(log.createdAt).toLocaleString('en-GB', { 
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-border-light text-xs text-content-muted flex items-center justify-between bg-base/30">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        )}
      </div>
    </div>
  );
}
