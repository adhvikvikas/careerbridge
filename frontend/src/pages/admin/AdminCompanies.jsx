import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Check, X, Search, Loader2 } from 'lucide-react';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [processingId, setProcessingId] = useState(null);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [targetId, setTargetId] = useState(null);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api(`/admin/companies?status=${filter}`);
      setCompanies(data.companies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await api(`/admin/companies/${id}/approve`, { method: 'PATCH' });
      fetchCompanies();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (id) => {
    setTargetId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      if (rejectReason.length < 5) return alert('Reason too short');
      setProcessingId(targetId);
      setShowRejectModal(false);
      await api(`/admin/companies/${targetId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectReason })
      });
      fetchCompanies();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
      setTargetId(null);
    }
  };

  return (
    <AdminLayout title="Manage Companies">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === status 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No {filter.toLowerCase()} companies found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {filter === 'PENDING' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map(company => (
                <tr key={company.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.location || 'No location'}</div>
                    {company.rejectionReason && (
                      <div className="text-xs text-red-500 mt-1">Reason: {company.rejectionReason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{company.recruiter?.name}</div>
                    <div className="text-sm text-gray-500">{company.recruiter?.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {company.industry || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      company.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      company.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  {filter === 'PENDING' && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleApprove(company.id)}
                        disabled={processingId === company.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </button>
                      <button 
                        onClick={() => handleRejectClick(company.id)}
                        disabled={processingId === company.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reject Company</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32"
              placeholder="Please provide a reason for rejection (min 5 chars)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
              <button onClick={confirmReject} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCompanies;
