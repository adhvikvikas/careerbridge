import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';

const STATUS_ORDER = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

const ProgressTracker = ({ status }) => {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center w-full max-w-2xl mt-6 relative">
        <div className="absolute top-1.5 left-2 right-2 h-0.5 bg-border-light -z-10" />
        {STATUS_ORDER.map((step, idx) => {
          const isFirst = idx === 0;
          return (
            <div key={step} className="flex-1 flex flex-col items-center relative">
              <div className={`w-3 h-3 rounded-full mb-2 ${isFirst ? 'bg-primary' : step === 'SELECTED' ? 'bg-border-light' : 'bg-red-500'}`} />
              <div className={`text-[10px] font-bold ${isFirst ? 'text-primary' : 'text-content-muted'}`}>
                {isFirst ? 'Applied' : step === 'SELECTED' ? '' : 'Rejected'}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);
  
  return (
    <div className="flex items-center w-full max-w-2xl mt-6 relative">
      <div className="absolute top-1.5 left-4 right-4 h-0.5 bg-border-light -z-10" />
      {/* Active progress bar line */}
      {currentIndex > 0 && (
        <div 
          className="absolute top-1.5 left-4 h-0.5 bg-primary -z-10 transition-all duration-500" 
          style={{ width: `calc(${(currentIndex / (STATUS_ORDER.length - 1)) * 100}% - 32px)` }} 
        />
      )}
      
      {STATUS_ORDER.map((step, idx) => {
        const isActive = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <div key={step} className="flex-1 flex flex-col items-center relative">
            <div className={`w-3.5 h-3.5 rounded-full mb-2 border-2 ${
              isActive 
                ? 'bg-primary border-primary' 
                : 'bg-surface border-border-light'
            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`} />
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-content-muted'}`}>
              {step.replace('_', ' ')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api('/student/applications');
      if (response.success) {
        setApplications(response.applications);
      }
    } catch (err) {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading applications..." />;
  if (error) return <ErrorState message={error} onRetry={fetchApplications} />;

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.job?.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">My Applications</div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-2">
          My Applications
        </h1>
        <p className="text-content-muted">Track your application progress and stay updated.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-content-muted absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search by company or role..." 
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border-light rounded-md text-sm text-navy focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="w-full md:w-40 border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select className="w-full md:w-48 border border-border-light rounded-md px-3 py-2 text-sm text-navy bg-surface focus:ring-1 focus:ring-primary outline-none">
            <option value="newest">Sort by Newest First</option>
            <option value="oldest">Sort by Oldest First</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No Applications Found"
          description={applications.length === 0 ? "You haven't applied to any opportunities yet." : "No applications match your filters."}
          actionText={applications.length === 0 ? "Explore Opportunities" : "Clear Filters"}
          onAction={() => {
            if (applications.length === 0) window.location.href = '/student/jobs';
            else { setSearchQuery(''); setStatusFilter(''); }
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app.id} className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-base border border-border-light text-navy rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                    {app.job?.company?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1">{app.job?.title}</h3>
                    <div className="text-sm font-medium text-content-muted mb-1">
                      {app.job?.company?.name} {app.job?.company?.location ? `- ${app.job.company.location}` : ''}
                    </div>
                    <div className="text-xs text-content-muted">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  
                  <Link to={`/student/applications/${app.id}`}>
                    <Button variant="outline" size="sm" className="border-border-light text-navy hover:bg-base">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-light">
                <ProgressTracker status={app.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
