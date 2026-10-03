import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ icon, title, description, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center p-16 text-center border border-border-light bg-surface">
    <div className="mb-6 text-content-muted">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-content tracking-tight uppercase">{title}</h3>
    <p className="mt-2 text-sm text-content-muted max-w-sm">
      {description}
    </p>
    {actionText && onAction && (
      <Button variant="inverted" className="mt-8" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

export const LoadingState = ({ message = "LOADING..." }) => (
  <div className="flex flex-col items-center justify-center p-16 h-full min-h-[300px]">
    <Loader2 className="w-8 h-8 text-inverted animate-spin mb-6" />
    <p className="text-xs font-bold uppercase tracking-widest text-content-muted">{message}</p>
  </div>
);

export const ErrorState = ({ title = "ERROR DETECTED", message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-16 text-center border border-border-light bg-surface">
    <AlertTriangle className="w-10 h-10 text-status-danger mb-6" />
    <h3 className="text-xl font-bold text-content tracking-tight uppercase">{title}</h3>
    <p className="mt-2 text-sm text-content-muted max-w-md">
      {message || "An unexpected error occurred. Please try again."}
    </p>
    {onRetry && (
      <Button variant="secondary" className="mt-8" onClick={onRetry}>
        RETRY CONNECTION
      </Button>
    )}
  </div>
);
