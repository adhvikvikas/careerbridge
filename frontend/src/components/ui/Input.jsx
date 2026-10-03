import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-content uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3 bg-surface border text-sm transition-colors
            focus:outline-none focus:border-inverted
            disabled:bg-base disabled:text-content-muted
            ${error ? 'border-status-danger' : 'border-border-light'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-xs text-status-danger font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-content uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 bg-surface border text-sm transition-colors resize-y
          focus:outline-none focus:border-inverted
          disabled:bg-base disabled:text-content-muted
          ${error ? 'border-status-danger' : 'border-border-light'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-xs text-status-danger font-medium">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-content uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-3 bg-surface border text-sm transition-colors appearance-none
          focus:outline-none focus:border-inverted
          disabled:bg-base disabled:text-content-muted
          ${error ? 'border-status-danger' : 'border-border-light'}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs text-status-danger font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
