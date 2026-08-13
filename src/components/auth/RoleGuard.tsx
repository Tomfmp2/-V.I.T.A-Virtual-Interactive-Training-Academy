import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizePlatformRole, type PlatformRole } from '../../utils/coursePermissions';

interface RoleGuardProps {
  allowedRoles: PlatformRole[];
  children: ReactNode;
}

/** Protects routes at render time; UI visibility is never the access control. */
export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = normalizePlatformRole(user?.rol);
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
