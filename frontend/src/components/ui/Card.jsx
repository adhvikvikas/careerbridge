import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-surface border border-border-light ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-8 py-6 border-b border-border-light ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg tracking-tight font-semibold text-content uppercase ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-8 py-6 border-t border-border-light ${className}`}>
    {children}
  </div>
);
