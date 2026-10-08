import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { LoadingState, ErrorState } from './ui/States';

const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingState message="Restoring session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roles = allowedRoles || (allowedRole ? [allowedRole] : null);

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <ErrorState 
          title="Access Denied" 
          message="You do not have permission to view this portal." 
          onRetry={() => window.history.back()} 
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
