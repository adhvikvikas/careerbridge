import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Search, Filter, Mail, GraduationCap, ChevronRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterAllApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/recruiter/applications?${params.toString()}`);
      setApplications(response.data.applications);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">APPLICANT TRACKING</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">
            Applications
          </h1>
          <p className="text-content-muted text-base">Review and manage applications across your job postings.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            type="text"
            placeholder="Search by candidate email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-content-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading && applications.length === 0 ? (
          <div className="p-8">
            <LoadingState message="Loading applications..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-sm text-content-muted bg-surface/50">
            No applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface border-b border-border-light text-xs uppercase font-semibold text-content-muted">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Job</th>
                  <th className="px-6 py-4">Academic</th>
                  <th className="px-6 py-4">Applied</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-base/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {(app.student?.name || app.student?.user?.name || app.student?.user?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{app.student?.name || app.student?.user?.name || app.student?.user?.email?.split('@')[0] || 'Unknown Candidate'}</p>
                          <p className="text-xs text-content-muted flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {app.student.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-content-muted" />
                        <span className="font-medium text-navy">{app.job.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {app.student.branch && (
                          <div className="text-navy">{app.student.branch}</div>
                        )}
                        <div className="text-content-muted flex items-center gap-2">
                          {app.student.cgpa && <span>CGPA: <span className="font-medium text-navy">{app.student.cgpa}</span></span>}
                          {app.student.graduationYear && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" /> {app.student.graduationYear}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-content-muted">
                      {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/recruiter/applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight className="w-3 h-3 ml-1" />
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
