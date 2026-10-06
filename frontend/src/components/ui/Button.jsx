import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon,
  'aria-label': ariaLabel,
  title,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-transparent shadow-sm";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-surface text-content border-border-light hover:bg-base",
    danger: "bg-status-danger text-white hover:opacity-90",
    ghost: "bg-transparent text-content-muted hover:text-content hover:bg-base shadow-none",
    outline: "bg-transparent text-content border-border-light hover:border-border-dark"
  };

  const sizes = {
    sm: "px-4 py-2 h-9",
    md: "px-6 py-3 h-12",
    lg: "px-8 py-4 h-14 text-sm",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      aria-label={ariaLabel || title || (!children && icon ? 'Icon button' : undefined)}
      title={title}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
