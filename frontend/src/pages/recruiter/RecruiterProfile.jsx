import React, { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { api } from '../../services/api';
import { Building2, User, Mail, Phone, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const RecruiterProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api('/recruiter/profile');
        setProfile(data.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <RecruiterLayout title="My Company">
        <div className="text-gray-500">Loading profile...</div>
      </RecruiterLayout>
    );
  }

  if (!profile) {
    return (
      <RecruiterLayout title="My Company">
        <div className="text-red-500">Failed to load profile.</div>
      </RecruiterLayout>
    );
  }

  const company = profile.companies[0];

  return (
    <RecruiterLayout title="My Company">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recruiter Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Recruiter Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <div className="mt-1 text-gray-900 font-medium">{profile.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="w-4 h-4 mr-1" /> Email
              </label>
              <div className="mt-1 text-gray-900 font-medium">{profile.user?.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <Phone className="w-4 h-4 mr-1" /> Phone
              </label>
              <div className="mt-1 text-gray-900 font-medium">{profile.phone || '-'}</div>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary-600" />
              Company Details
            </div>
            {company && (
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                company.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                company.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {company.status}
              </span>
            )}
          </h2>
          
          {company ? (
            <div className="space-y-4">
              {company.status === 'REJECTED' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Company Rejected</h4>
                    <p className="text-sm text-red-700 mt-1">{company.rejectionReason}</p>
                  </div>
                </div>
              )}
              {company.status === 'PENDING' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Pending Approval</h4>
                    <p className="text-sm text-yellow-700 mt-1">Your company is waiting for admin approval. You can create jobs, but they will not be visible to students until the company is approved.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Company Name</label>
                <div className="mt-1 text-gray-900 font-medium">{company.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <div className="mt-1 text-gray-900">{company.industry || '-'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <div className="mt-1 text-gray-900">{company.location || '-'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Website</label>
                <div className="mt-1 text-blue-600 hover:underline">
                  <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website || '-'}</a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <div className="mt-1 text-gray-900 text-sm whitespace-pre-wrap">{company.description || '-'}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No company registered yet.</div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterProfile;
