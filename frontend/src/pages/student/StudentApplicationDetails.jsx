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
    <div className="space-y-12">
      <Link to="/student/applications">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Telemetry
        </Button>
      </Link>

      <div className="border border-border-strong bg-inverted text-content-inverted p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="absolute inset-0 grid-lines-dark opacity-30 pointer-events-none mix-blend-overlay z-0"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-accent flex items-center justify-center font-bold text-inverted text-2xl shrink-0">
            {job.recruiter.companyName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{job.title}</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {job.recruiter.companyName}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-start md:items-end gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-content-inverted-muted">Pipeline Status</span>
          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="w-5 h-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-border-light">
                {application.statusHistory?.map((history, idx) => (
                  <div key={history.id} className="relative flex items-center justify-between group pl-12">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-inverted bg-base flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 bg-inverted rounded-full" />
                    </div>
                    <div className="w-full bg-surface border border-border-light p-6 group-hover:border-inverted transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="text-lg font-bold tracking-tight uppercase">{history.newStatus}</div>
                        <time className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
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
            <CardHeader>
              <CardTitle>Opportunity Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border border-border-light flex items-center justify-center bg-base text-content-muted shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-1">Location</p>
                  <p className="text-sm font-bold tracking-tight uppercase">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border border-border-light flex items-center justify-center bg-base text-content-muted shrink-0">
                  <BriefcaseBusiness className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-1">Classification</p>
                  <p className="text-sm font-bold tracking-tight uppercase">{job.jobType}</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border-light">
                <Link to={`/student/jobs/${job.id}`}>
                  <Button variant="outline-inverted" className="w-full">
                    VIEW ORIGINAL POSTING
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
