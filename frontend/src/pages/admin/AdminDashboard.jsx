import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowRight, Building2, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, companiesRes, jobsRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/companies?status=PENDING'),
          api.get('/admin/jobs?status=PENDING')
        ]);
        setStats(statsRes.data.stats);
        setPendingCompanies(companiesRes.data.companies || []);
        setPendingJobs(jobsRes.data.jobs || []);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;

  const pendingItems = [
    ...pendingCompanies.map(c => ({
      type: 'COMPANY',
      title: c.name,
      subtitle: c.industry || 'Unknown Industry',
      submittedBy: c.recruiter?.name || 'Unknown',
      submittedByEmail: c.recruiter?.user?.email || 'Unknown',
      status: 'PENDING',
      submittedOn: c.createdAt,
      link: `/admin/companies/${c.id}`
    })),
    ...pendingJobs.map(j => ({
      type: 'JOB',
      title: j.title,
      subtitle: j.company?.name || 'Unknown Company',
      submittedBy: j.company?.recruiter?.name || 'Unknown',
      submittedByEmail: j.company?.recruiter?.user?.email || 'Unknown',
      status: 'PENDING',
      submittedOn: j.createdAt,
      link: `/admin/jobs/${j.id}`
    }))
  ].sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
            ADMINISTRATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">
            Platform Governance
          </h1>
          <p className="text-content-muted text-base max-w-2xl">
            Review and manage company registrations, job postings, and monitor administrative activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Companies Row */}
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-warning/10 text-status-warning rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Pending Companies</p>
            <h3 className="text-3xl font-bold text-navy leading-none mb-1">{stats.companies.pending}</h3>
            <p className="text-xs text-content-muted">Needs review</p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-success/10 text-status-success rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Approved Companies</p>
            <h3 className="text-3xl font-bold text-navy leading-none mb-1">{stats.companies.approved}</h3>
            <p className="text-xs text-content-muted">Total approved</p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-danger/10 text-status-danger rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Rejected Companies</p>
            <h3 className="text-3xl font-bold text-navy leading-none mb-1">{stats.companies.rejected}</h3>
            <p className="text-xs text-content-muted">Total rejected</p>
          </div>
        </Card>

        {/* Jobs Row */}
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-warning/10 text-status-warning rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Pending Jobs</p>
            <h3 className="text-3xl font-bold text-navy leading-none mb-1">{stats.jobs.pending}</h3>
            <p className="text-xs text-content-muted">Needs review</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-success/10 text-status-success rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Approved Jobs</p>
            <h3 className="text-3xl font-bold text-navy leading-none mb-1">{stats.jobs.approved}</h3>
            <p className="text-xs text-content-muted">Total approved</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-status-danger/10 text-status-danger rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">Rejected Jobs</p>
            <h3 className="text-3xl font-bold text-navy leading-none mb-1">{stats.jobs.rejected}</h3>
            <p className="text-xs text-content-muted">Total rejected</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-status-warning" />
            <div>
              <h2 className="text-lg font-bold text-navy">Requires Attention</h2>
              <p className="text-sm text-content-muted">Items currently waiting for your review.</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-semibold text-primary">
            <Link to="/admin/companies" className="hover:underline">View all companies &rarr;</Link>
            <Link to="/admin/jobs" className="hover:underline">View all jobs &rarr;</Link>
          </div>
        </div>
        
        {pendingItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-status-success" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">You're all caught up.</h3>
            <p className="text-sm text-content-muted max-w-sm mx-auto">
              There are no companies or job postings waiting for administrative review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface border-b border-border-light text-xs uppercase font-semibold text-content-muted">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Submitted By</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted On</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {pendingItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-base/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-border-light text-xs font-bold text-navy uppercase">
                        {item.type === 'JOB' ? <Briefcase className="w-3.5 h-3.5 text-primary" /> : <Building2 className="w-3.5 h-3.5 text-primary" />}
                        {item.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-navy">{item.title}</div>
                      <div className="text-xs text-content-muted mt-0.5">{item.subtitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy">{item.submittedBy}</div>
                      <div className="text-xs text-content-muted mt-0.5">{item.submittedByEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-content-muted">
                      {new Date(item.submittedOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={item.link}>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 text-primary border-primary/20 hover:bg-primary/5">
                          Review &rarr;
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
