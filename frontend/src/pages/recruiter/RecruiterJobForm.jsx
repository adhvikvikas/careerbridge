import React, { useState, useEffect } from 'react';
import RecruiterLayout from '../../components/RecruiterLayout';
import { api } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const RecruiterJobForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minCgpa: '',
    departments: '',
    graduationYears: '',
    deadline: '',
    openings: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          const data = await api(`/recruiter/jobs/${id}`);
          const job = data.job;
          setStatus(job.status);
          setFormData({
            title: job.title,
            description: job.description,
            minCgpa: job.minCgpa || '',
            departments: job.departments.join(', '),
            graduationYears: job.graduationYears.join(', '),
            deadline: new Date(job.deadline).toISOString().split('T')[0],
            openings: job.openings || ''
          });
        } catch (err) {
          setError('Failed to fetch job details');
        } finally {
          setFetching(false);
        }
      };
      fetchJob();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        minCgpa: formData.minCgpa ? parseFloat(formData.minCgpa) : null,
        departments: formData.departments.split(',').map(d => d.trim()).filter(Boolean),
        graduationYears: formData.graduationYears.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y)),
        deadline: new Date(formData.deadline).toISOString(),
        openings: formData.openings ? parseInt(formData.openings) : null
      };

      if (isEdit) {
        await api(`/recruiter/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/recruiter/jobs', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <RecruiterLayout title="Edit Job"><div className="text-gray-500">Loading...</div></RecruiterLayout>;

  return (
    <RecruiterLayout title={isEdit ? 'Edit Job Posting' : 'Post a New Job'}>
      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {isEdit && status === 'APPROVED' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This job is currently <strong>APPROVED</strong>. Submitting significant edits will reset its status to <strong>PENDING</strong> and require admin review again.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              required
              minLength={20}
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Minimum 20 characters..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum CGPA</label>
              <input
                type="number"
                name="minCgpa"
                step="0.01"
                min="0"
                max="10"
                value={formData.minCgpa}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. 7.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Openings</label>
              <input
                type="number"
                name="openings"
                min="1"
                value={formData.openings}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Departments * (Comma separated)</label>
            <input
              type="text"
              name="departments"
              required
              value={formData.departments}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. CS, IT, ECE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Graduation Years * (Comma separated)</label>
            <input
              type="text"
              name="graduationYears"
              required
              value={formData.graduationYears}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. 2027, 2028"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
            <input
              type="date"
              name="deadline"
              required
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/recruiter/jobs')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterJobForm;
