import api from './http';
import type { Category, CategoryRequest } from '../types/category';

/** Lectura: cualquier usuario autenticado. Escritura: solo Admin (lo impone el backend). */
export const getCategoriesApi = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};

export const createCategoryApi = async (categoria: CategoryRequest): Promise<Category> => {
  const response = await api.post<Category>('/categories', categoria);
  return response.data;
};

export const updateCategoryApi = async (
  id: number,
  categoria: CategoryRequest,
): Promise<Category> => {
  const response = await api.put<Category>(`/categories/${id}`, categoria);
  return response.data;
};

/**
 * 204 si se eliminó. El backend responde 409 cuando la categoría está en uso
 * por cursos; la pantalla debe conservar la fila y avisar, nunca borrarla en local.
 */
export const deleteCategoryApi = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
