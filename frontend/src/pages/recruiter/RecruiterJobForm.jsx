import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/States';
import { BriefcaseBusiness, Users, AlertTriangle } from 'lucide-react';

export default function RecruiterJobForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'FULL_TIME',
    salary: '',
    deadline: '',
    cgpaRequired: '',
    allowedBranches: []
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/recruiter/jobs/${id}`);
      const job = response.data.job;

      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary || '',
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
        cgpaRequired: job.cgpaRequired ? job.cgpaRequired.toString() : '',
        allowedBranches: job.allowedBranches || []
      });
    } catch (err) {
      setError('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchToggle = (branch) => {
    setFormData(prev => {
      const branches = [...prev.allowedBranches];
      if (branches.includes(branch)) {
        return { ...prev, allowedBranches: branches.filter(b => b !== branch) };
      } else {
        return { ...prev, allowedBranches: [...branches, branch] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        cgpaRequired: formData.cgpaRequired ? parseFloat(formData.cgpaRequired) : null,
      };

      if (isEditing) {
        await api.put(`/recruiter/jobs/${id}`, payload);
      } else {
        await api.post('/recruiter/jobs', payload);
      }

      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save job.');
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING OPPORTUNITY SCHEMA..." />;

  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  return (
    <div className="space-y-12">
      <div className="border-b border-border-dark pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
            {isEditing ? 'MODIFY OPPORTUNITY' : 'INITIALIZE OPPORTUNITY'}
          </h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">
            Define role parameters and eligibility requirements.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/recruiter/jobs')}>
          CANCEL OPERATION
        </Button>
      </div>

      {error && (
        <div className="p-6 border border-status-danger bg-status-danger/10 text-status-danger text-xs font-bold uppercase tracking-widest flex items-center gap-4">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isEditing && (
        <div className="p-6 border border-status-warning bg-status-warning/10 text-status-warning text-xs font-bold uppercase tracking-widest flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Note: Modifying this opportunity will reset its status to PENDING and require administrative approval again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BriefcaseBusiness className="w-5 h-5" />
                Role Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Opportunity Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="e.g. Senior Software Engineer"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Classification"
                  value={formData.jobType}
                  onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                  options={[
                    { value: 'FULL_TIME', label: 'Full Time' },
                    { value: 'INTERNSHIP', label: 'Internship' }
                  ]}
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder="e.g. Bangalore, Remote"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Compensation (Optional)"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  placeholder="e.g. ₹15 LPA"
                />
                <Input
                  label="Application Deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                />
              </div>

              <Textarea
                label="Role Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={5}
                placeholder="Detail the responsibilities and scope of this role..."
              />

              <Textarea
                label="Requirements & Skills"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                required
                rows={4}
                placeholder="List required skills, technologies, and experience..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Eligibility Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <Input
                label="Minimum CGPA Requirement"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpaRequired}
                onChange={(e) => setFormData({...formData, cgpaRequired: e.target.value})}
                required
                placeholder="e.g. 7.5"
              />

              <div>
                <label className="block text-xs font-semibold text-content uppercase tracking-wider mb-4">
                  Target Departments / Branches
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {branches.map(branch => {
                    const isSelected = formData.allowedBranches.includes(branch);
                    return (
                      <div
                        key={branch}
                        onClick={() => handleBranchToggle(branch)}
                        className={`cursor-pointer px-4 py-3 border text-center transition-colors text-xs font-bold uppercase tracking-widest ${
                          isSelected
                            ? 'bg-inverted text-content-inverted border-inverted'
                            : 'bg-surface text-content-muted border-border-light hover:border-border-dark'
                        }`}
                      >
                        {branch}
                      </div>
                    );
                  })}
                </div>
                {formData.allowedBranches.length === 0 && (
                  <p className="mt-3 text-xs text-status-warning font-semibold uppercase tracking-widest">
                    ⚠ Select at least one department to target this opportunity.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end pt-8 border-t border-border-dark">
          <Button
            type="submit"
            variant="inverted"
            size="lg"
            loading={saving}
            disabled={formData.allowedBranches.length === 0}
          >
            {isEditing ? 'COMMIT MODIFICATIONS' : 'INITIALIZE OPPORTUNITY'}
          </Button>
        </div>
      </form>
    </div>
  );
}
