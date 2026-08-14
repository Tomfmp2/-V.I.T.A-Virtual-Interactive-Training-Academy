import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getRoleHomePath } from '../../utils/coursePermissions';

interface GuestGuardProps {
  children: ReactNode;
}

/** Login/register are only for guests. An active session goes to its role home. */
export const GuestGuard = ({ children }: GuestGuardProps) => {
  const { token, user } = useAuth();

  if (token) {
    return <Navigate to={getRoleHomePath(user?.rol) ?? '/home'} replace />;
  }

  return <>{children}</>;
};
