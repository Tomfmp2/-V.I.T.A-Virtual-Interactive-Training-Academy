export type PlatformRole = 'admin' | 'instructor' | 'estudiante';

export type CoursePermission =
  | 'viewCourse' | 'enterCourse' | 'createCourse' | 'editCourse' | 'deleteCourse'
  | 'viewLesson' | 'enterLesson' | 'createLesson' | 'editLesson' | 'deleteLesson'
  | 'manageCategory';

export type CoursePermissions = Record<CoursePermission, boolean>;

const readOnlyPermissions: CoursePermissions = {
  viewCourse: true, enterCourse: true, createCourse: false, editCourse: false, deleteCourse: false,
  viewLesson: true, enterLesson: true, createLesson: false, editLesson: false, deleteLesson: false,
  manageCategory: false,
};

const fullPermissions: CoursePermissions = {
  viewCourse: true, enterCourse: true, createCourse: true, editCourse: true, deleteCourse: true,
  viewLesson: true, enterLesson: true, createLesson: true, editLesson: true, deleteLesson: true,
  manageCategory: true,
};

const noPermissions: CoursePermissions = {
  viewCourse: false, enterCourse: false, createCourse: false, editCourse: false, deleteCourse: false,
  viewLesson: false, enterLesson: false, createLesson: false, editLesson: false, deleteLesson: false,
  manageCategory: false,
};

export const normalizePlatformRole = (role?: string | null): PlatformRole | null => {
  const normalized = role?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'administrador') return 'admin';
  if (normalized === 'instructor') return 'instructor';
  if (normalized === 'estudiante') return 'estudiante';
  return null;
};

/** Single source of truth. Unknown and unauthenticated roles are denied by default. */
export const getCoursePermissions = (role?: string | null): CoursePermissions => {
  const platformRole = normalizePlatformRole(role);
  if (platformRole === 'admin' || platformRole === 'instructor') return fullPermissions;
  if (platformRole === 'estudiante') return readOnlyPermissions;
  return noPermissions;
};

export const canAccessCourse = (role: string | null | undefined, permission: CoursePermission): boolean =>
  getCoursePermissions(role)[permission];

export const getRoleHomePath = (role?: string | null): string | null => {
  const platformRole = normalizePlatformRole(role);
  if (!platformRole) return null;
  return `/${platformRole}`;
};

export const isAdminRole = (role?: string | null): boolean =>
  normalizePlatformRole(role) === 'admin';

export const isInstructorRole = (role?: string | null): boolean =>
  normalizePlatformRole(role) === 'instructor';

export const isStudentRole = (role?: string | null): boolean =>
  normalizePlatformRole(role) === 'estudiante';
