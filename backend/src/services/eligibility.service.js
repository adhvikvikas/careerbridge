const DEPARTMENT_MAPPING = {
  'COMPUTER SCIENCE': 'CSE',
  'COMPUTER SCIENCE AND ENGINEERING': 'CSE',
  'INFORMATION TECHNOLOGY': 'IT',
  'ELECTRONICS AND COMMUNICATION': 'ECE',
  'MECHANICAL': 'MECH',
  'CIVIL': 'CIVIL',
  'ELECTRICAL AND ELECTRONICS': 'EEE'
};

const normalizeDepartment = (dept) => {
  if (!dept) return '';
  const normalized = dept.toUpperCase().trim();
  return DEPARTMENT_MAPPING[normalized] || normalized;
};

exports.checkEligibility = (job, studentProfile) => {
  const reasons = [];
  
  if (job.status !== 'APPROVED') {
    reasons.push('Job is not approved');
  }

  if (new Date(job.deadline) < new Date()) {
    reasons.push('Application deadline has passed');
  }

  if (job.minCgpa && (!studentProfile.cgpa || studentProfile.cgpa < job.minCgpa)) {
    reasons.push(`Minimum CGPA required is ${job.minCgpa}`);
  }

  if (job.departments && job.departments.length > 0) {
    const jobDepts = job.departments.map(normalizeDepartment);
    const studentDept = normalizeDepartment(studentProfile.branch);
    if (!studentDept || !jobDepts.includes(studentDept)) {
      reasons.push(`Open only to departments: ${job.departments.join(', ')}`);
    }
  }

  if (job.graduationYears && job.graduationYears.length > 0) {
    if (!studentProfile.graduationYear || !job.graduationYears.includes(studentProfile.graduationYear)) {
      reasons.push(`Open only to graduation years: ${job.graduationYears.join(', ')}`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
};
