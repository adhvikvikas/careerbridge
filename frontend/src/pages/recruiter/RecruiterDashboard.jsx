import React, { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { api } from '../../services/api';
import { Briefcase, Users, FileText, CheckCircle } from 'lucide-react';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api('/recruiter/dashboard-stats');
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, count, icon: Icon, colorClass, bgColorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`p-4 rounded-full ${bgColorClass} mr-4`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );

  return (
    <RecruiterLayout title="Dashboard">
      {loading ? (
        <div className="text-gray-500">Loading dashboard...</div>
      ) : stats ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
              Jobs Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Jobs" count={stats.jobs.total} icon={Briefcase} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
              <StatCard title="Pending Approval" count={stats.jobs.pending} icon={FileText} colorClass="text-yellow-600" bgColorClass="bg-yellow-50" />
              <StatCard title="Approved Jobs" count={stats.jobs.approved} icon={CheckCircle} colorClass="text-green-600" bgColorClass="bg-green-50" />
              <StatCard title="Rejected Jobs" count={stats.jobs.rejected} icon={FileText} colorClass="text-red-600" bgColorClass="bg-red-50" />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Applications Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Applicants" count={stats.applications.total} icon={Users} colorClass="text-purple-600" bgColorClass="bg-purple-50" />
              <StatCard title="Under Review" count={stats.applications.underReview} icon={FileText} colorClass="text-orange-600" bgColorClass="bg-orange-50" />
              <StatCard title="Shortlisted" count={stats.applications.shortlisted} icon={CheckCircle} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" />
              <StatCard title="Selected" count={stats.applications.selected} icon={CheckCircle} colorClass="text-green-600" bgColorClass="bg-green-50" />
            </div>
          </section>
        </div>
      ) : (
        <div className="text-red-500">Failed to load dashboard. Ensure your company is registered.</div>
      )}
    </RecruiterLayout>
  );
};

export default RecruiterDashboard;
