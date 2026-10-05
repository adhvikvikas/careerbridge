import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { BriefcaseBusiness, MapPin, IndianRupee, ArrowLeft, Bookmark, CheckSquare, XSquare, Send } from 'lucide-react';

export default function StudentJobDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/student/jobs/${id}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setMessage(null);
    try {
      await api.post(`/student/jobs/${id}/apply`);
      setMessage({ type: 'success', text: 'APPLICATION TRANSMITTED SUCCESSFULLY' });
      await fetchJobDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'FAILED TO SUBMIT APPLICATION' });
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (data.isSaved) {
        await api.delete(`/student/saved-jobs/${id}`);
        setMessage({ type: 'success', text: 'OPPORTUNITY REMOVED FROM SAVED LIST' });
      } else {
        await api.post(`/student/jobs/${id}/save`);
        setMessage({ type: 'success', text: 'OPPORTUNITY BOOKMARKED' });
      }
      await fetchJobDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'FAILED TO SAVE JOB' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING OPPORTUNITY DETAILS..." />;
  if (error) return <ErrorState message={error} />;

  const { job, isEligible, eligibilityReasons, hasApplied, isSaved } = data;

  return (
    <div className="space-y-8">
      <Link to="/student/jobs">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-2">
          Back to Jobs
        </Button>
      </Link>

      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success/20 text-status-success' : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckSquare className="w-5 h-5 shrink-0" /> : <XSquare className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface border border-border-light rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0">
              {job.recruiter.companyName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-content tracking-tight mb-2">{job.title}</h1>
              <p className="text-lg font-medium text-content-muted">{job.recruiter.companyName}</p>

              <div className="flex flex-wrap gap-4 mt-4">
                <span className="flex items-center gap-2 text-sm font-medium text-content-muted">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
                <span className="flex items-center gap-2 text-sm font-medium text-content-muted">
                  <BriefcaseBusiness className="w-4 h-4" /> {job.jobType.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-2 text-sm font-medium text-content-muted">
                  <IndianRupee className="w-4 h-4" /> {job.salary || 'Not disclosed'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-64 shrink-0">
            {hasApplied ? (
              <Button disabled variant="outline" className="w-full text-status-success border-status-success bg-status-success/5 opacity-100" icon={<CheckSquare className="w-4 h-4" />}>
                Already Applied
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                loading={applying}
                disabled={!isEligible}
                variant="primary"
                className="w-full"
                icon={<Send className="w-4 h-4" />}
              >
                Apply Now
              </Button>
            )}

            <Button
              variant="outline"
              className={`w-full ${isSaved ? 'text-primary border-primary bg-primary/5' : ''}`}
              onClick={handleSave}
              loading={saving}
              icon={<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-light rounded-2xl p-8">
            <h2 className="text-lg font-bold text-content mb-6">Role Description</h2>
            <div className="prose prose-sm max-w-none text-content-muted whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          <div className="bg-surface border border-border-light rounded-2xl p-8">
            <h2 className="text-lg font-bold text-content mb-6">Requirements & Skills</h2>
            <div className="prose prose-sm max-w-none text-content-muted whitespace-pre-wrap leading-relaxed">
              {job.requirements}
            </div>
          </div>
        </div>

        {/* Right Column - Eligibility & Meta */}
        <div className="space-y-8">

          {/* Eligibility Matrix */}
          <div className={`border rounded-2xl p-6 ${isEligible ? 'border-status-success/20 bg-status-success/5' : 'border-status-danger/20 bg-status-danger/5'}`}>
            <div className="border-b border-inherit pb-4 mb-5">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-1">
                {isEligible ? (
                  <><CheckSquare className="w-5 h-5 text-status-success" /> <span className="text-status-success">Eligible to Apply</span></>
                ) : (
                  <><XSquare className="w-5 h-5 text-status-danger" /> <span className="text-status-danger">Not Eligible</span></>
                )}
              </h2>
              <p className="text-xs font-medium text-content-muted ml-7">System Check Results</p>
            </div>

            <ul className="space-y-3">
              {eligibilityReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {reason.passed ? (
                    <CheckSquare className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  ) : (
                    <XSquare className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm font-medium leading-tight ${reason.passed ? 'text-content-muted' : 'text-content'}`}>
                    {reason.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border-light rounded-2xl p-6">
            <h2 className="text-sm font-bold text-content mb-5">Job Metadata</h2>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-content-muted mb-1">Application Deadline</p>
                <p className="text-sm font-semibold text-content">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-content-muted mb-1">Posted On</p>
                <p className="text-sm font-semibold text-content">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
