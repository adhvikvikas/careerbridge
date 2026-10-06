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
    minCgpa: '',
    departments: [],
    graduationYears: [],
    deadline: '',
    openings: '',
    employmentType: 'FULL_TIME'
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
        title: job.title || '',
        description: job.description || '',
        minCgpa: job.minCgpa ? job.minCgpa.toString() : '',
        departments: job.departments || [],
        graduationYears: job.graduationYears ? job.graduationYears.join(', ') : '',
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
        openings: job.openings ? job.openings.toString() : '',
        employmentType: job.employmentType || 'FULL_TIME'
      });
    } catch (err) {
      setError('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentToggle = (dept) => {
    setFormData(prev => {
      const depts = [...prev.departments];
      if (depts.includes(dept)) {
        return { ...prev, departments: depts.filter(d => d !== dept) };
      } else {
        return { ...prev, departments: [...depts, dept] };
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
        minCgpa: formData.minCgpa ? parseFloat(formData.minCgpa) : null,
        openings: formData.openings ? parseInt(formData.openings) : null,
        graduationYears: formData.graduationYears 
          ? formData.graduationYears.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y))
          : []
      };

      if (isEditing) {
        await api.patch(`/recruiter/jobs/${id}`, payload);
      } else {
        await api.post('/recruiter/jobs', payload);
      }

      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.');
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="LOADING OPPORTUNITY..." />;

  const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="pb-6 border-b border-border-light flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2">
            {isEditing ? 'Edit Opportunity' : 'Post Opportunity'}
          </h1>
          <p className="text-sm font-medium text-content-muted">
            Define role parameters and eligibility requirements.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/recruiter/jobs')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger text-sm font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {isEditing && (
        <div className="p-4 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning text-sm font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Note: Modifying this opportunity will reset its status to PENDING and require administrative approval again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3">
                <BriefcaseBusiness className="w-5 h-5 text-content-muted" />
                Role Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
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
                  value={formData.employmentType}
                  onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                  options={[
                    { value: 'FULL_TIME', label: 'Full Time' },
                    { value: 'INTERNSHIP', label: 'Internship' },
                    { value: 'PART_TIME', label: 'Part Time' },
                    { value: 'CONTRACT', label: 'Contract' }
                  ]}
                />
                <Input
                  label="Openings"
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={(e) => setFormData({...formData, openings: e.target.value})}
                  placeholder="e.g. 5"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
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
                rows={6}
                placeholder="Detail the responsibilities and scope of this role..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border-light bg-base/50">
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5 text-content-muted" />
                Eligibility Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <Input
                label="Minimum CGPA Requirement"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.minCgpa}
                onChange={(e) => setFormData({...formData, minCgpa: e.target.value})}
                placeholder="e.g. 7.5"
              />

              <Input
                label="Eligible Graduation Years"
                value={formData.graduationYears}
                onChange={(e) => setFormData({...formData, graduationYears: e.target.value})}
                placeholder="e.g. 2024, 2025"
              />

              <div>
                <label className="block text-sm font-semibold text-content mb-3">
                  Target Departments / Branches
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {branches.map(dept => {
                    const isSelected = formData.departments.includes(dept);
                    return (
                      <div
                        key={dept}
                        onClick={() => handleDepartmentToggle(dept)}
                        className={`cursor-pointer px-4 py-3 rounded-lg border text-center transition-colors text-sm font-medium ${
                          isSelected
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-surface text-content-muted border-border-light hover:border-primary/20'
                        }`}
                      >
                        {dept}
                      </div>
                    );
                  })}
                </div>
                {formData.departments.length === 0 && (
                  <p className="mt-3 text-xs text-status-warning font-medium">
                    ⚠ Select at least one department to target this opportunity.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            disabled={formData.departments.length === 0}
          >
            {isEditing ? 'Save Changes' : 'Post Opportunity'}
          </Button>
        </div>
      </form>
    </div>
  );
}
