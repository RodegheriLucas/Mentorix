import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PenaltyBlockScreen } from '../pages/PenaltyBlockScreen';
import { Skeleton } from '../components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  checkPenalty?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles, checkPenalty = true }) => {
  const { user, loading, isSuspended } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} height={60} />)}
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.papel)) return <Navigate to="/" replace />;

  if (checkPenalty && isSuspended()) return <PenaltyBlockScreen />;

  return <>{children}</>;
};
