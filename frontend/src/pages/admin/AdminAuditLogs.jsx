import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { FileText } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <LoadingState message="RETRIEVING AUDIT TELEMETRY..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">SYSTEM AUDIT TELEMETRY</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Immutable ledger of administrative actions.</p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="NO LOGS DETECTED"
          description="The system audit ledger is currently empty."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TIMESTAMP</TableHead>
              <TableHead>ADMINISTRATOR</TableHead>
              <TableHead>ACTION TYPE</TableHead>
              <TableHead>TARGET ENTITY</TableHead>
              <TableHead>METADATA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-xs font-semibold tracking-widest text-content-muted uppercase whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="font-bold tracking-tight uppercase">{log.admin.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    log.action.includes('REJECT') ? 'danger' :
                    log.action.includes('APPROVE') ? 'success' : 'default'
                  }>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold tracking-widest text-content-muted uppercase">
                    {log.targetType} <br/> {log.targetId}
                  </span>
                </TableCell>
                <TableCell>
                  {log.reason ? (
                    <div className="text-xs text-content-muted max-w-xs truncate" title={log.reason}>
                      {log.reason}
                    </div>
                  ) : (
                    <span className="text-content-muted/50">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
