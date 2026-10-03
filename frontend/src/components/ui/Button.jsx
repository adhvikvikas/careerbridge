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
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs border border-transparent";

  const variants = {
    primary: "bg-inverted text-content-inverted hover:bg-inverted/90",
    secondary: "bg-surface text-content border-border-light hover:bg-base",
    accent: "bg-accent text-inverted hover:bg-accent-hover",
    danger: "bg-status-danger text-white hover:bg-red-600",
    ghost: "bg-transparent text-content-muted hover:text-content border-transparent hover:border-border-light",
    inverted: "bg-white text-inverted hover:bg-gray-100",
    'outline-inverted': "bg-transparent text-content-inverted border-border-dark hover:border-content-inverted"
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
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
