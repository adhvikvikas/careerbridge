import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import api from '../../services/api';
import { Building, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';

const StudentApplicationDetails = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/student/applications/${id}`);
        setApp(res.data.application);
      } catch (err) {
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Applied</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Under Review</span>;
      case 'SHORTLISTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Shortlisted</span>;
      case 'INTERVIEW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Interview</span>;
      case 'SELECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Selected</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) return <StudentLayout title="Application Details"><div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></StudentLayout>;
  if (error) return <StudentLayout title="Application Details"><div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div></StudentLayout>;
  if (!app) return <StudentLayout title="Application Details"><div className="text-gray-500">Not found</div></StudentLayout>;

  return (
    <StudentLayout title="Application Details">
      <div className="mb-6">
        <Link to="/student/applications" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          &larr; Back to Applications
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{app.job.title}</h1>
                  <div className="flex items-center text-lg text-gray-600 font-medium">
                    <Building className="mr-2 h-5 w-5" />
                    {app.job.company.name}
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 border-y border-gray-100 py-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <MapPin className="mr-1.5 h-4 w-4 text-gray-400" /> Location
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{app.job.company.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <Calendar className="mr-1.5 h-4 w-4 text-gray-400" /> Applied On
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div className="md:col-span-1 col-span-2">
                  <Link to={`/student/jobs/${app.job.id}`} className="text-sm text-primary-600 hover:underline font-medium">
                    View Job Posting &rarr;
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Timeline</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {app.statusHistory.map((history, idx) => (
                      <li key={history.id}>
                        <div className="relative pb-8">
                          {idx !== app.statusHistory.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center ring-8 ring-white">
                                <Clock className="h-4 w-4 text-primary-600" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Status changed to <span className="font-medium text-gray-900">{history.newStatus}</span>
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time dateTime={history.changedAt}>{new Date(history.changedAt).toLocaleString()}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-medium text-gray-900">Important Info</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-500 mt-1">Your application was successfully sent to {app.job.company.name}. They will review it based on their timeline.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentApplicationDetails;
