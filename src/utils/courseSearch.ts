import type { CourseListItem } from '../types/course';

/** Búsqueda local por título, categoría, nivel, instructor o descripción. */
export const matchesCourseSearch = (
  course: Pick<
    CourseListItem,
    'titulo' | 'categoriaNombre' | 'nivelNombre' | 'instructorNombre' | 'descripcionCorta'
  >,
  rawTerm: string,
): boolean => {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return true;

  const haystack = [
    course.titulo,
    course.categoriaNombre,
    course.nivelNombre,
    course.instructorNombre,
    course.descripcionCorta ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
};

export const matchesTextSearch = (value: string, rawTerm: string): boolean => {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return true;
  return value.toLowerCase().includes(term);
};
