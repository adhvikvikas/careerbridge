import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import api from '../../services/api';
import { Building, MapPin, Calendar, Users, GraduationCap, FileText, CheckCircle, AlertCircle, Bookmark } from 'lucide-react';

const StudentJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/student/jobs/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
    // eslint-disable-next-line
  }, [id]);

  const handleApply = async () => {
    if (!window.confirm('Are you sure you want to apply for this job?')) return;
    
    setActionLoading(true);
    try {
      await api.post(`/student/jobs/${id}/apply`);
      alert('Application submitted successfully!');
      fetchJobDetails(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSave = async () => {
    setActionLoading(true);
    try {
      if (data.isSaved) {
        await api.delete(`/student/jobs/${id}/save`);
      } else {
        await api.post(`/student/jobs/${id}/save`);
      }
      fetchJobDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update saved status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <StudentLayout title="Job Details"><div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></StudentLayout>;
  if (error) return <StudentLayout title="Job Details"><div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div></StudentLayout>;
  if (!data) return <StudentLayout title="Job Details"><div className="text-gray-500">Not found</div></StudentLayout>;

  const { job, eligibility, isSaved, hasApplied, applicationStatus } = data;

  return (
    <StudentLayout title="Job Details">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/student/jobs')}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Jobs
        </button>
        <div className="flex space-x-3">
          <button
            onClick={toggleSave}
            disabled={actionLoading}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSaved 
                ? 'border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save Job'}
          </button>
          
          {hasApplied ? (
            <button
              disabled
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 cursor-not-allowed"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Applied ({applicationStatus})
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={!eligibility.eligible || actionLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                eligibility.eligible 
                  ? 'bg-primary-600 hover:bg-primary-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center text-lg text-primary-700 font-medium mb-6">
                <Building className="mr-2 h-5 w-5" />
                {job.company.name}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-y border-gray-100 py-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <MapPin className="mr-1.5 h-4 w-4 text-gray-400" /> Location
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{job.company.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <Calendar className="mr-1.5 h-4 w-4 text-gray-400" /> Deadline
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <Users className="mr-1.5 h-4 w-4 text-gray-400" /> Openings
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{job.openings || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <FileText className="mr-1.5 h-4 w-4 text-gray-400" /> Industry
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{job.company.industry || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Job Description</h3>
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
              
              {job.company.description && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">About {job.company.name}</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {job.company.description}
                  </div>
                  {job.company.website && (
                    <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-primary-600 hover:underline">
                      Visit Website &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-medium text-gray-900">Eligibility Status</h3>
            </div>
            <div className="p-6">
              {eligibility.eligible ? (
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">You are eligible to apply</p>
                    <p className="text-sm text-gray-500 mt-1">Your profile meets all the requirements for this position.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">You are not eligible</p>
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside space-y-1">
                      {eligibility.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                    <div className="mt-4 text-xs text-gray-500">
                      Update your <Link to="/student/profile" className="text-primary-600 hover:underline">profile</Link> if you believe this is incorrect.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-medium text-gray-900">Requirements</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Minimum CGPA</p>
                <p className="text-sm text-gray-900 font-medium">{job.minCgpa ? `${job.minCgpa} and above` : 'No minimum requirement'}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                  <GraduationCap className="h-3.5 w-3.5 mr-1" /> Eligible Departments
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.departments && job.departments.length > 0 ? (
                    job.departments.map(dept => (
                      <span key={dept} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {dept}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-900">Open to all branches</span>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Graduation Years</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.graduationYears && job.graduationYears.length > 0 ? (
                    job.graduationYears.map(yr => (
                      <span key={yr} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {yr}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-900">Any year</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentJobDetails;
