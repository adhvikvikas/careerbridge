import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { 
  Briefcase, 
  MapPin, 
  ArrowLeft, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  User, 
  Globe
} from 'lucide-react';

export default function StudentJobDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await api(`/student/jobs/${id}`);
      if (response.success) {
        setData(response);
      } else {
        setError('Failed to load job details.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setMessage(null);
    try {
      await api(`/student/jobs/${id}/apply`, { method: 'POST' });
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      await fetchJobDetails(); // Refresh to update hasApplied state
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit application.' });
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (data.isSaved) {
        await api(`/student/jobs/${id}/save`, { method: 'DELETE' });
      } else {
        await api(`/student/jobs/${id}/save`, { method: 'POST' });
      }
      // Optimistically update
      setData(prev => ({ ...prev, isSaved: !prev.isSaved }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save job.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading Opportunity Details..." />;
  if (error) return <ErrorState message={error} />;

  const { job, eligibility, isSaved, hasApplied, applicationStatus } = data;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <Link to="/student/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-content-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Opportunities
      </Link>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row justify-between lg:items-start gap-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 bg-base border border-border-light text-navy rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0 shadow-sm">
            {job.company?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight mb-2">{job.title}</h1>
            <p className="text-lg font-medium text-content-muted mb-4">{job.company?.name}</p>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {job.company?.location || 'Location Not Specified'}
              </span>
              {job.departments?.length > 0 && (
                <span className="px-3 py-1 bg-gray-50 text-content-muted rounded-md text-xs font-semibold border border-border-light">
                  {job.departments.join(', ')}
                </span>
              )}
              {job.graduationYears?.length > 0 && (
                <span className="px-3 py-1 bg-gray-50 text-content-muted rounded-md text-xs font-semibold border border-border-light">
                  {job.graduationYears.join(', ')} Batch
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-64 shrink-0">
          {hasApplied ? (
            <Button disabled variant="outline" className="w-full text-green-700 border-green-200 bg-green-50 opacity-100 font-bold" icon={<CheckCircle2 className="w-4 h-4" />}>
              Applied
            </Button>
          ) : (
            <Button
              onClick={handleApply}
              loading={applying}
              disabled={!eligibility.eligible}
              variant="primary"
              className="w-full h-12 text-base font-bold shadow-sm"
              icon={<Send className="w-4 h-4" />}
            >
              Apply Now
            </Button>
          )}

          <Button
            variant="outline"
            className={`w-full h-11 font-semibold ${isSaved ? 'text-primary border-primary bg-primary/5' : 'text-navy border-border-light'}`}
            onClick={handleSave}
            loading={saving}
            icon={<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
          >
            {isSaved ? 'Saved' : 'Save Job'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-surface border border-border-light rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-border-light overflow-x-auto">
              {['overview', 'about-company'].map(tab => (
                <button
                  key={tab}
                  className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-content-muted hover:text-navy hover:bg-base'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
            
            <div className="p-6 md:p-8">
              {activeTab === 'overview' && (
                <div className="prose prose-sm md:prose-base max-w-none text-content-muted whitespace-pre-wrap leading-relaxed">
                  <h3 className="text-lg font-bold text-navy mb-4">Job Description & Requirements</h3>
                  {job.description}
                </div>
              )}
              {activeTab === 'about-company' && (
                <div className="prose prose-sm md:prose-base max-w-none text-content-muted whitespace-pre-wrap leading-relaxed">
                  <h3 className="text-lg font-bold text-navy mb-4">About {job.company?.name}</h3>
                  {job.company?.description ? (
                    <p>{job.company.description}</p>
                  ) : (
                    <p>No description provided.</p>
                  )}
                  {job.company?.website && (
                    <div className="mt-6">
                      <a href={job.company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                        <Globe className="w-4 h-4" /> Visit Website
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Meta Information */}
        <div className="space-y-6">
          
          {/* Important Information */}
          <div className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-5">Important Information</h3>
            <div className="space-y-5">
              <div className="flex gap-4">
                <Calendar className="w-5 h-5 text-content-muted shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Application Deadline</div>
                  <div className="text-sm font-medium text-navy">{new Date(job.deadline).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-content-muted shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Work Location</div>
                  <div className="text-sm font-medium text-navy">{job.company?.location || 'N/A'}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <BookOpen className="w-5 h-5 text-content-muted shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Eligible Branches</div>
                  <div className="text-sm font-medium text-navy">{job.departments?.join(', ') || 'Any'}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <User className="w-5 h-5 text-content-muted shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Minimum CGPA</div>
                  <div className="text-sm font-medium text-navy">{job.minCgpa || 'No minimum'}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <GraduationCap className="w-5 h-5 text-content-muted shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-content-muted mb-0.5">Batch</div>
                  <div className="text-sm font-medium text-navy">{job.graduationYears?.join(', ') || 'Any'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility Matrix */}
          {!hasApplied && (
            <div className={`border rounded-2xl p-5 shadow-sm ${eligibility.eligible ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
              <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                {eligibility.eligible ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /> <span className="text-green-700">Eligible to Apply</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /> <span className="text-red-700">Not Eligible</span></>
                )}
              </h2>
              
              {!eligibility.eligible && eligibility.reasons.length > 0 && (
                <ul className="space-y-2 mt-3 pt-3 border-t border-red-200/50">
                  {eligibility.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-red-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
