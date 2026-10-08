import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import { Briefcase, FileText, CheckCircle, XCircle, Clock, Bookmark, Bell } from 'lucide-react';
import api from '../../services/api';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/student/dashboard-stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <StudentLayout title="Dashboard"><div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></StudentLayout>;
  if (error) return <StudentLayout title="Dashboard"><div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div></StudentLayout>;

  return (
    <StudentLayout title="Student Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Available Jobs" value={stats.stats.approvedJobsCount} icon={Briefcase} color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Applications" value={stats.stats.applications.total} icon={FileText} color="bg-primary-100 text-primary-600" />
        <StatCard title="Shortlisted" value={stats.stats.applications.shortlisted} icon={Clock} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Selected" value={stats.stats.applications.selected} icon={CheckCircle} color="bg-green-100 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Application Summary</h2>
              <Link to="/student/applications" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{stats.stats.applications.underReview}</div>
                  <div className="text-sm text-gray-500">Under Review</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.stats.applications.shortlisted}</div>
                  <div className="text-sm text-gray-500">Shortlisted</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.stats.applications.selected}</div>
                  <div className="text-sm text-gray-500">Selected</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.stats.applications.rejected}</div>
                  <div className="text-sm text-gray-500">Rejected</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/student/jobs" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 transition-colors flex items-center gap-4">
              <div className="p-4 bg-primary-50 text-primary-600 rounded-full">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Discover Jobs</h3>
                <p className="text-sm text-gray-500">Browse {stats.stats.approvedJobsCount} available opportunities</p>
              </div>
            </Link>
            <Link to="/student/saved-jobs" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 transition-colors flex items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                <Bookmark size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Saved Jobs</h3>
                <p className="text-sm text-gray-500">You have {stats.stats.savedJobsCount} saved jobs</p>
              </div>
            </Link>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Bell size={18} className="text-gray-500" /> Recent Notifications
              </h2>
              <Link to="/student/notifications" className="text-sm text-primary-600 hover:text-primary-700">All</Link>
            </div>
            <div className="p-0">
              {stats.recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No recent notifications</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {stats.recentNotifications.map(notification => (
                    <li key={notification.id} className={`p-4 ${!notification.readAt ? 'bg-blue-50' : 'bg-white'}`}>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
    <div className={`p-4 rounded-full ${color} mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
