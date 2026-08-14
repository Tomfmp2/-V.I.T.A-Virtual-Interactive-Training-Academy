import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoursesApi } from '../../api/coursesApi';
import { enrollApi } from '../../api/enrollmentsApi';
import { resolveEnrollmentError } from '../../utils/apiErrors';
import type { CourseListItem } from '../../types/course';
import './DomainShared.css';

export interface ExploreCoursesPageProps {
  mode?: 'enroll' | 'browse';
}

const isPublishedCourse = (course: CourseListItem): boolean =>
  course.estado.trim().toLowerCase() === 'publicado';

export const ExploreCoursesPage = ({ mode = 'enroll' }: ExploreCoursesPageProps) => {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [enrollErrors, setEnrollErrors] = useState<Record<number, string>>({});

  const publishedCourses = useMemo(() => courses.filter(isPublishedCourse), [courses]);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getCoursesApi();
      setCourses(data);
    } catch {
      setLoadError('No se pudo cargar el catálogo de cursos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const handleEnroll = async (course: CourseListItem) => {
    setEnrollingCourseId(course.id);
    setEnrollErrors((current) => {
      const next = { ...current };
      delete next[course.id];
      return next;
    });
    setFeedback('');

    try {
      await enrollApi({ cursoId: course.id });
      setFeedback(`Te inscribiste en "${course.titulo}".`);
    } catch (error) {
      setEnrollErrors((current) => ({
        ...current,
        [course.id]: resolveEnrollmentError(error),
      }));
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const showEnrollActions = mode === 'enroll';

  return (
    <section className="domain-page" aria-labelledby="explore-courses-title">
      <header className="domain-heading">
        <div>
          <h1 id="explore-courses-title">Explorar cursos</h1>
          <p>
            {showEnrollActions
              ? 'Descubre cursos publicados e inscríbete con un clic.'
              : 'Consulta el catálogo de cursos publicados.'}
          </p>
        </div>
      </header>

      {feedback && (
        <p className="domain-alert domain-alert-success" role="status">
          {feedback}
        </p>
      )}

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando cursos…
        </p>
      ) : loadError ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="domain-btn-ghost" onClick={() => void loadCourses()}>
            Reintentar
          </button>
        </div>
      ) : publishedCourses.length === 0 ? (
        <p className="domain-state">
          No hay cursos publicados disponibles en este momento.
        </p>
      ) : (
        <div className="domain-card-grid">
          {publishedCourses.map((course) => (
            <article key={course.id} className="domain-card">
              <span className="domain-badge domain-badge-cyan">{course.categoriaNombre}</span>
              <h2 className="domain-card-title">{course.titulo}</h2>
              <p className="domain-card-meta">
                {course.descripcionCorta || 'Sin descripción corta.'}
              </p>
              <p className="domain-card-meta">
                Instructor: {course.instructorNombre}
              </p>
              <p className="domain-card-meta">
                Nivel: {course.nivelNombre}
              </p>

              {showEnrollActions && (
                <div className="domain-card-actions">
                  <button
                    type="button"
                    className="domain-btn-primary"
                    disabled={enrollingCourseId === course.id}
                    onClick={() => void handleEnroll(course)}
                  >
                    {enrollingCourseId === course.id ? 'Inscribiendo…' : 'Inscribirme'}
                  </button>
                </div>
              )}

              {enrollErrors[course.id] && (
                <p className="domain-inline-error" role="alert">
                  {enrollErrors[course.id]}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
