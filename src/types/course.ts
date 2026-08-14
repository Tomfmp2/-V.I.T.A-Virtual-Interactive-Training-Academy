/** Espejo de Vita.Api Dtos/Courses */
export interface CourseListItem {
  id: number;
  titulo: string;
  slug: string;
  descripcionCorta?: string | null;
  imagenPortadaUrl?: string | null;
  categoriaNombre: string;
  nivelNombre: string;
  estado: string;
  instructorNombre: string;
  createdAt: string;
}

export interface Course extends CourseListItem {
  descripcionLarga?: string | null;
  duracionEstimadaMin?: number | null;
  idCategoria: number;
  idNivel: number;
  idInstructor: string;
  updateAt?: string | null;
}

export interface CourseCreateRequest {
  titulo: string;
  idCategoria: number;
  idNivel: number;
  descripcionCorta?: string | null;
  descripcionLarga?: string | null;
  imagenPortadaUrl?: string | null;
  duracionEstimadaMin?: number | null;
}

export interface CourseAdminCreateRequest extends CourseCreateRequest {
  idInstructor: string;
}

export interface CourseUpdateRequest extends CourseCreateRequest {}

export interface CourseStatusRequest {
  estado: 'borrador' | 'publicado' | string;
}
