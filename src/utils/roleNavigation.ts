import { normalizePlatformRole, type PlatformRole } from './coursePermissions';

export type RoleNavIcon =
  | 'dashboard'
  | 'courses'
  | 'explore'
  | 'certificate'
  | 'users'
  | 'categories'
  | 'settings';

export interface RoleNavItem {
  id: string;
  label: string;
  icon: RoleNavIcon;
}

const navItemsByRole: Record<PlatformRole, RoleNavItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'my-courses', label: 'Cursos', icon: 'courses' },
    { id: 'explore', label: 'Explorar', icon: 'explore' },
    { id: 'certs', label: 'Certificados', icon: 'certificate' },
    { id: 'users', label: 'Usuarios', icon: 'users' },
    { id: 'categories', label: 'Categorías', icon: 'categories' },
    { id: 'settings', label: 'Configuración', icon: 'settings' },
  ],
  instructor: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'my-courses', label: 'Mis Clases', icon: 'courses' },
    { id: 'explore', label: 'Explorar', icon: 'explore' },
    { id: 'certs', label: 'Certificados', icon: 'certificate' },
    { id: 'settings', label: 'Configuración', icon: 'settings' },
  ],
  estudiante: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'my-courses', label: 'Mis Cursos', icon: 'courses' },
    { id: 'settings', label: 'Configuración', icon: 'settings' },
  ],
};

const areaLabels: Record<PlatformRole, string> = {
  admin: 'Panel Administrador',
  instructor: 'Panel Instructor',
  estudiante: 'Panel Estudiante',
};

/** Única fuente de verdad de las rutas por área; la consumen el router y los guards. */
export const roleRouteAccess: Record<string, PlatformRole[]> = {
  '/admin': ['admin'],
  '/instructor': ['admin', 'instructor'],
  '/estudiante': ['estudiante'],
};

export const canAccessRoute = (role: string | null | undefined, routeBase: string): boolean => {
  const allowedRoles = roleRouteAccess[routeBase];
  if (!allowedRoles) return false;

  const platformRole = normalizePlatformRole(role);
  return !!platformRole && allowedRoles.includes(platformRole);
};

/** Menu shown in the dashboard layout. Route guards remain the real access control. */
export const getRoleNavItems = (role?: string | null): RoleNavItem[] => {
  const platformRole = normalizePlatformRole(role);
  return platformRole ? navItemsByRole[platformRole] : [];
};

export const getRoleAreaLabel = (role?: string | null): string => {
  const platformRole = normalizePlatformRole(role);
  return platformRole ? areaLabels[platformRole] : 'Sin área asignada';
};
