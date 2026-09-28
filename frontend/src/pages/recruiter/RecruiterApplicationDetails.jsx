import React, { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { api } from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import { User, FileText, Calendar, Edit3, CheckCircle } from 'lucide-react';

const RecruiterApplicationDetails = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notesUpdating, setNotesUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const fetchApplication = async () => {
    try {
      const data = await api(`/recruiter/applications/${id}`);
      setApp(data.application);
      setNotes(data.application.recruiterNotes || '');
      setNewStatus(data.application.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setStatusUpdating(true);
      await api(`/recruiter/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note: statusNote })
      });
      setStatusNote('');
      fetchApplication();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpdateNotes = async (e) => {
    e.preventDefault();
    try {
      setNotesUpdating(true);
      await api(`/recruiter/applications/${id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      });
      alert('Notes saved successfully');
    } catch (err) {
      alert(err.message || 'Failed to update notes');
    } finally {
      setNotesUpdating(false);
    }
  };

  if (loading) {
    return <RecruiterLayout title="Application Details"><div className="text-gray-500">Loading...</div></RecruiterLayout>;
  }

  if (!app) {
    return <RecruiterLayout title="Application Details"><div className="text-red-500">Application not found.</div></RecruiterLayout>;
  }

  return (
    <RecruiterLayout title="Candidate Application">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Candidate & Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Candidate Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 text-gray-900 font-medium">{app.student?.user?.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Applied For</label>
                <div className="mt-1 text-primary-600 font-medium">
                  <Link to={`/recruiter/jobs/${app.job.id}`}>{app.job.title}</Link>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <div className="mt-1 text-gray-900">{app.student?.branch || '-'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                <div className="mt-1 text-gray-900">{app.student?.graduationYear || '-'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CGPA</label>
                <div className="mt-1 text-gray-900">{app.student?.cgpa || '-'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Active Backlogs</label>
                <div className="mt-1 text-gray-900">{app.student?.backlogs || '0'}</div>
              </div>
            </div>
            {app.student?.resumeUrl && (
              <div className="mt-6">
                <a href={app.student.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100 transition">
                  <FileText className="w-4 h-4 mr-2" /> View Resume
                </a>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Status History
            </h2>
            <div className="space-y-4">
              {app.statusHistory.length === 0 ? (
                <div className="text-gray-500 text-sm">No status changes recorded yet.</div>
              ) : (
                app.statusHistory.map((history, idx) => (
                  <div key={history.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-0 last:pb-0">
                    <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-white"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {history.oldStatus ? `${history.oldStatus} → ` : ''}{history.newStatus}
                        </div>
                        {history.note && <div className="text-sm text-gray-600 mt-1">{history.note}</div>}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(history.changedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Notes */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary-600" />
              Update Status
            </h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Note (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared round 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={statusUpdating || newStatus === app.status}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {statusUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-primary-600" />
              Private Recruiter Notes
            </h2>
            <form onSubmit={handleUpdateNotes}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Add private notes about this candidate..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm mb-3"
              ></textarea>
              <button
                type="submit"
                disabled={notesUpdating}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 transition"
              >
                {notesUpdating ? 'Saving...' : 'Save Notes'}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3 text-center">These notes are only visible to you.</p>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterApplicationDetails;
