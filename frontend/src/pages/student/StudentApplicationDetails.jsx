import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { ArrowLeft, MapPin, BriefcaseBusiness, History, Building2 } from 'lucide-react';

export default function StudentApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/student/applications/${id}`);
        setApplication(response.data.application);
        setError(null);
      } catch (err) {
        setError('Failed to load application telemetry.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingState message="RETRIEVING APPLICATION TELEMETRY..." />;
  if (error) return <ErrorState message={error} />;

  const { job } = application;

  return (
    <div className="space-y-8">
      <Link to="/student/applications">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-2">
          Back to Applications
        </Button>
      </Link>

      <div className="bg-surface border border-border-light rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0">
            {job.recruiter.companyName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-content mb-1">{job.title}</h1>
            <p className="text-sm font-medium text-content-muted flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {job.recruiter.companyName}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-start md:items-end gap-2 shrink-0">
          <span className="text-xs font-semibold text-content-muted">Pipeline Status</span>
          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3">
                <History className="w-5 h-5 text-content-muted" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-[2px] before:bg-border-light">
                {application.statusHistory?.map((history, idx) => (
                  <div key={history.id} className="relative flex items-center justify-between group pl-10">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-surface bg-base flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div className="w-full bg-base border border-border-light rounded-xl p-5 hover:border-primary/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="text-base font-bold text-content">{history.newStatus.replace('_', ' ')}</div>
                        <time className="text-xs font-medium text-content-muted">
                          {new Date(history.createdAt).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle>Opportunity Meta</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-content-muted mb-0.5">Location</p>
                  <p className="text-sm font-semibold text-content">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <BriefcaseBusiness className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-content-muted mb-0.5">Classification</p>
                  <p className="text-sm font-semibold text-content">{job.jobType.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border-light">
                <Link to={`/student/jobs/${job.id}`}>
                  <Button variant="secondary" className="w-full">
                    View Original Posting
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
