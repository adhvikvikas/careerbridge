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
    <div className="space-y-12">
      <Link to="/student/jobs">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
          Return to List
        </Button>
      </Link>

      {message && (
        <div className={`p-6 border text-xs font-bold uppercase tracking-widest flex items-center gap-4 ${
          message.type === 'success' ? 'bg-status-success/10 border-status-success text-status-success' : 'bg-status-danger/10 border-status-danger text-status-danger'
        }`}>
          {message.type === 'success' ? <CheckSquare className="w-5 h-5" /> : <XSquare className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Hero Header */}
      <div className="border border-border-strong bg-inverted text-content-inverted p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-lines-dark opacity-30 pointer-events-none mix-blend-overlay z-0"></div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10">
          <div className="flex gap-8 items-start">
            <div className="w-24 h-24 bg-accent flex items-center justify-center font-bold text-inverted text-4xl shrink-0">
              {job.recruiter.companyName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-4">{job.title}</h1>
              <p className="text-xl font-bold uppercase tracking-widest text-accent mb-8">{job.recruiter.companyName}</p>

              <div className="flex flex-wrap gap-6">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-content-inverted-muted">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-content-inverted-muted border-l border-border-dark pl-6">
                  <BriefcaseBusiness className="w-4 h-4" /> {job.jobType}
                </span>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-content-inverted-muted border-l border-border-dark pl-6">
                  <IndianRupee className="w-4 h-4" /> {job.salary || 'Not disclosed'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-64 shrink-0">
            {hasApplied ? (
              <Button disabled variant="secondary" className="w-full bg-status-success text-white border-status-success opacity-100" icon={<CheckSquare className="w-5 h-5" />}>
                ALREADY APPLIED
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                loading={applying}
                disabled={!isEligible}
                variant="accent"
                className="w-full"
                icon={<Send className="w-5 h-5" />}
              >
                APPLY NOW
              </Button>
            )}

            <Button
              variant="outline-inverted"
              className="w-full"
              onClick={handleSave}
              loading={saving}
              icon={<Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />}
            >
              {isSaved ? 'SAVED' : 'SAVE OPPORTUNITY'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-12">

          <div className="border-t-2 border-border-strong pt-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-content-muted mb-8">Role Description</h2>
            <div className="prose prose-sm max-w-none text-content whitespace-pre-wrap text-base font-medium leading-relaxed">
              {job.description}
            </div>
          </div>

          <div className="border-t-2 border-border-strong pt-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-content-muted mb-8">Requirements & Skills</h2>
            <div className="prose prose-sm max-w-none text-content whitespace-pre-wrap text-base font-medium leading-relaxed">
              {job.requirements}
            </div>
          </div>
        </div>

        {/* Right Column - Eligibility & Meta */}
        <div className="space-y-12">

          {/* Eligibility Matrix */}
          <div className={`border-2 p-8 ${isEligible ? 'border-status-success bg-status-success/5' : 'border-status-danger bg-status-danger/5'}`}>
            <div className="border-b border-inherit pb-6 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-content mb-2 flex items-center gap-3">
                {isEligible ? (
                  <><CheckSquare className="w-5 h-5 text-status-success" /> <span className="text-status-success">ELIGIBILITY VALIDATED</span></>
                ) : (
                  <><XSquare className="w-5 h-5 text-status-danger" /> <span className="text-status-danger">NOT ELIGIBLE</span></>
                )}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">System Check Results</p>
            </div>

            <ul className="space-y-4">
              {eligibilityReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  {reason.passed ? (
                    <CheckSquare className="w-5 h-5 text-status-success shrink-0" />
                  ) : (
                    <XSquare className="w-5 h-5 text-status-danger shrink-0" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider mt-0.5 leading-relaxed ${reason.passed ? 'text-content-muted' : 'text-content'}`}>
                    {reason.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t-2 border-border-strong pt-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-content-muted mb-8">Metadata</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Application Deadline</p>
                <p className="text-lg font-bold tracking-tight uppercase">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Posted On</p>
                <p className="text-lg font-bold tracking-tight uppercase">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
