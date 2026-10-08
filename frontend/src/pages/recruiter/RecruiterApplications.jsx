import React, { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { api } from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import { User, Eye, Search } from 'lucide-react';

const RecruiterApplications = () => {
  const { id: jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter) queryParams.append('status', statusFilter);
        if (searchName) queryParams.append('name', searchName);

        const [jobData, appData] = await Promise.all([
          api(`/recruiter/jobs/${jobId}`),
          api(`/recruiter/jobs/${jobId}/applications?${queryParams.toString()}`)
        ]);
        
        setJob(jobData.job);
        setApplications(appData.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId, statusFilter, searchName]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the effect dependency
  };

  return (
    <RecruiterLayout title={`Applicants for ${job ? job.title : 'Job'}`}>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading applicants...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No applicants found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department/Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{app.student?.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {app.student?.branch || '-'} ({app.student?.graduationYear || '-'})
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {app.student?.cgpa || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/recruiter/applications/${app.id}`} className="text-primary-600 hover:text-primary-900 inline-flex items-center text-sm font-medium">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterApplications;
