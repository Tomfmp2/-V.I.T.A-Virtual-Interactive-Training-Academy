import { isAxiosError } from 'axios';

/** Texto exigido por la tarjeta cuando el backend rechaza el borrado con 409. */
export const CATEGORY_IN_USE_MESSAGE = 'No se puede borrar: categoría en uso';

export const getHttpStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

/** Lee el mensaje del contrato BE `{ error, statusCode }`. */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as { error?: string; message?: string } | undefined;
  if (data?.error && typeof data.error === 'string') return data.error;
  if (data?.message && typeof data.message === 'string') return data.message;
  return fallback;
};

/**
 * 409 = la categoría está en uso por cursos. Cualquier otro fallo es genérico,
 * pero en todos los casos la fila permanece en la lista.
 */
export const resolveDeleteCategoryError = (error: unknown): string => {
  const status = getHttpStatus(error);
  if (status === 409) return CATEGORY_IN_USE_MESSAGE;
  if (status === 403) return 'No tienes permisos para eliminar categorías.';
  if (status === 404) return 'La categoría ya no existe. Actualiza la lista.';
  return 'No se pudo eliminar la categoría. Intenta de nuevo.';
};

export const resolveSaveCategoryError = (error: unknown): string => {
  const status = getHttpStatus(error);
  if (status === 409) return 'Ya existe una categoría con ese nombre.';
  if (status === 403) return 'No tienes permisos para gestionar categorías.';
  if (status === 400) return 'Revisa los datos: el backend rechazó la categoría.';
  if (status === 404) return 'La categoría ya no existe. Actualiza la lista.';
  return 'No se pudo guardar la categoría. Intenta de nuevo.';
};

export const resolveEnrollmentError = (error: unknown): string => {
  const status = getHttpStatus(error);
  if (status === 409) return 'Ya estás inscrito en este curso.';
  if (status === 400) return getApiErrorMessage(error, 'El curso no está disponible para inscripción.');
  if (status === 404) return 'Curso no encontrado.';
  if (status === 403) return 'No tienes permisos para inscribirte.';
  return getApiErrorMessage(error, 'No se pudo completar la inscripción.');
};
