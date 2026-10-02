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
    if (!studentProfile.branch || !job.departments.includes(studentProfile.branch)) {
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
