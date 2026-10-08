import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { ArrowLeft, MapPin, History, ExternalLink, Calendar, BookOpen } from 'lucide-react';

const STATUS_ORDER = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

const ProgressTracker = ({ status }) => {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center w-full mt-6 relative">
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
    <div className="flex items-center w-full mt-6 relative">
      <div className="absolute top-1.5 left-4 right-4 h-0.5 bg-border-light -z-10" />
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

export default function StudentApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api(`/student/applications/${id}`);
        if (response.success) {
          setApplication(response.application);
        } else {
          setError('Failed to load application details.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingState message="Loading Application Details..." />;
  if (error) return <ErrorState message={error} />;

  const { job, statusHistory } = application;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <Link to="/student/applications" className="inline-flex items-center gap-2 text-sm font-medium text-content-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 bg-base border border-border-light text-navy rounded-xl flex items-center justify-center font-bold text-2xl shrink-0">
            {job.company?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight mb-2">{job.title}</h1>
            <p className="text-lg font-medium text-content-muted mb-4">
              {job.company?.name} {job.company?.location ? `- ${job.company.location}` : ''}
            </p>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                application.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                application.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                application.status === 'SHORTLISTED' || application.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-700' :
                application.status === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {application.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-auto shrink-0 pt-2">
          <Link to={`/student/jobs/${job.id}`}>
            <Button variant="outline" className="w-full text-navy border-border-light hover:bg-base font-semibold" icon={<ExternalLink className="w-4 h-4" />}>
              View Original Posting
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-navy mb-6">Application Progress</h3>
        <div className="w-full max-w-3xl mx-auto px-4 pb-4">
          <ProgressTracker status={application.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Status History
            </h3>
            
            <div className="relative pl-6 before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-border-light before:h-full">
              {statusHistory?.length === 0 && (
                <p className="text-sm text-content-muted">No history recorded.</p>
              )}
              {statusHistory?.map((history, idx) => (
                <div key={history.id} className="relative mb-8 last:mb-0">
                  <div className="absolute -left-6 top-1 w-3 h-3 bg-base border-2 border-primary rounded-full shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-navy">{history.newStatus.replace('_', ' ')}</h4>
                    <p className="text-xs font-medium text-content-muted mt-1 mb-2">
                      {new Date(history.changedAt).toLocaleString()}
                    </p>
                    {history.note && (
                      <div className="bg-base rounded-md p-3 text-sm text-content-muted border border-border-light mt-2">
                        {history.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunity Meta */}
        <div className="space-y-6">
          <div className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-5">Application Details</h3>
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <Calendar className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Applied On</div>
                  <div className="text-sm font-medium text-navy">{new Date(application.appliedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Work Location</div>
                  <div className="text-sm font-medium text-navy">{job.company?.location || 'N/A'}</div>
                </div>
              </div>
              {job.departments?.length > 0 && (
                <div className="flex gap-4 items-start">
                  <BookOpen className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-content-muted mb-0.5">Eligible Branches</div>
                    <div className="text-sm font-medium text-navy">{job.departments.join(', ')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
