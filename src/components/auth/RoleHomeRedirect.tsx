import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../utils/coursePermissions';

/** Sends an authenticated user to the dashboard assigned to their role. */
export const RoleHomeRedirect = () => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  const homePath = getRoleHomePath(user?.rol);
  return <Navigate to={homePath ?? '/403'} replace />;
};
