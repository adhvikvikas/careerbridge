import React, { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Edit2, Users, FileText, Plus } from 'lucide-react';

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const query = filter ? `?status=${filter}` : '';
        const data = await api(`/recruiter/jobs${query}`);
        setJobs(data.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [filter]);

  return (
    <RecruiterLayout title="Jobs">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === status 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === '' ? 'ALL' : status}
            </button>
          ))}
        </div>
        <Link 
          to="/recruiter/jobs/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p>No jobs found.</p>
            <Link to="/recruiter/jobs/new" className="mt-4 text-primary-600 font-medium hover:underline">Create your first job posting</Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map(job => (
                <tr key={job.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    {job.rejectionReason && (
                      <div className="text-xs text-red-500 mt-1">Reason: {job.rejectionReason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      job.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(job.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {job._count?.applications || 0}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <Link to={`/recruiter/jobs/${job.id}/applications`} className="text-primary-600 hover:text-primary-900 inline-flex items-center text-sm font-medium">
                      <Users className="w-4 h-4 mr-1" /> View Applicants
                    </Link>
                    <Link to={`/recruiter/jobs/${job.id}/edit`} className="text-gray-500 hover:text-gray-900 inline-flex items-center text-sm font-medium">
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
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

export default RecruiterJobs;
