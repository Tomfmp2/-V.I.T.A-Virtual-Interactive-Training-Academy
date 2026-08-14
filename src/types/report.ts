/** Espejo de Vita.Api Dtos/Reports */
export interface CoursesByInstructorItem {
  instructorId: string;
  instructor: string;
  totalCursos: number;
}

export interface StudentsByCourseItem {
  cursoId: number;
  titulo: string;
  totalEstudiantes: number;
}

export interface TopCourseItem {
  cursoId: number;
  titulo: string;
  instructor: string;
  totalInscritos: number;
}
