/** Espejo de Vita.Api Dtos/Lessons */
export interface Lesson {
  id: number;
  cursoId: number;
  titulo: string;
  descripcion?: string | null;
  recurso?: string | null;
  orden: number;
}

export interface LessonRequest {
  titulo: string;
  descripcion?: string | null;
  recurso?: string | null;
  orden: number;
}
