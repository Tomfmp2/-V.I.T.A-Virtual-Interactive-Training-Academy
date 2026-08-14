/** Espejo de Vita.Api Dtos/Enrollments */
export interface Enrollment {
  id: number;
  cursoId: number;
  cursoTitulo: string;
  fechaInscripcion: string;
  estado: string;
}

export interface EnrollmentRequest {
  cursoId: number;
}
