import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-base text-content border-border-light',
    primary: 'bg-inverted text-content-inverted border-transparent',
    accent: 'bg-accent text-inverted border-transparent',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    info: 'bg-status-info/10 text-status-info border-status-info/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusMap = {
    PENDING: { variant: 'warning', label: 'Pending' },
    APPROVED: { variant: 'success', label: 'Approved' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    APPLIED: { variant: 'info', label: 'Applied' },
    UNDER_REVIEW: { variant: 'warning', label: 'Reviewing' },
    SHORTLISTED: { variant: 'primary', label: 'Shortlisted' },
    INTERVIEW: { variant: 'accent', label: 'Interview' },
    SELECTED: { variant: 'success', label: 'Selected' },
  };

  const config = statusMap[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
