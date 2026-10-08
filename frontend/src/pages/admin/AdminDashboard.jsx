import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Building2, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api('/admin/dashboard-stats');
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
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="text-gray-500">Loading dashboard...</div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary-600" />
              Company Governance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Pending Review" count={stats?.companies.pending || 0} icon={Clock} colorClass="text-yellow-600" bgColorClass="bg-yellow-50" />
              <StatCard title="Approved Companies" count={stats?.companies.approved || 0} icon={CheckCircle} colorClass="text-green-600" bgColorClass="bg-green-50" />
              <StatCard title="Rejected Companies" count={stats?.companies.rejected || 0} icon={XCircle} colorClass="text-red-600" bgColorClass="bg-red-50" />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
              Job Governance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Pending Review" count={stats?.jobs.pending || 0} icon={Clock} colorClass="text-yellow-600" bgColorClass="bg-yellow-50" />
              <StatCard title="Approved Jobs" count={stats?.jobs.approved || 0} icon={CheckCircle} colorClass="text-green-600" bgColorClass="bg-green-50" />
              <StatCard title="Rejected Jobs" count={stats?.jobs.rejected || 0} icon={XCircle} colorClass="text-red-600" bgColorClass="bg-red-50" />
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
