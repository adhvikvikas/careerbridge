import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import api from '../../services/api';
import { Bookmark, Building, MapPin, Calendar, Trash2 } from 'lucide-react';

const StudentSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/student/saved-jobs');
      setSavedJobs(res.data.savedJobs);
    } catch (err) {
      console.error('Failed to load saved jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/student/jobs/${jobId}/save`);
      fetchSavedJobs();
    } catch (err) {
      alert('Failed to unsave job');
    }
  };

  return (
    <StudentLayout title="Saved Jobs">
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg border border-gray-200 shadow-sm">
          <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No saved jobs</h3>
          <p className="mt-1 text-sm text-gray-500 mb-6">You haven't saved any jobs yet.</p>
          <Link to="/student/jobs" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            Discover Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((saved) => (
            <div key={saved.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{saved.job.title}</h3>
                  <button onClick={() => handleUnsave(saved.jobId)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove from saved">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Building className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <span className="line-clamp-1">{saved.job.company.name}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {saved.job.company.location || 'Not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    Deadline: {new Date(saved.job.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
                <Link
                  to={`/student/jobs/${saved.job.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentSavedJobs;
