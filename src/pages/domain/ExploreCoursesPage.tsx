import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoursesApi } from '../../api/coursesApi';
import { enrollApi } from '../../api/enrollmentsApi';
import { CoursePlayerView } from '../../components/domain/CoursePlayerView';
import { resolveEnrollmentError } from '../../utils/apiErrors';
import { matchesCourseSearch } from '../../utils/courseSearch';
import type { CourseListItem } from '../../types/course';
import './DomainShared.css';

export interface ExploreCoursesPageProps {
  mode?: 'enroll' | 'browse';
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
}

const isPublishedCourse = (course: CourseListItem): boolean =>
  course.estado.trim().toLowerCase() === 'publicado';

export const ExploreCoursesPage = ({
  mode = 'enroll',
  searchTerm: externalSearch,
  onSearchTermChange,
}: ExploreCoursesPageProps) => {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [enrollErrors, setEnrollErrors] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState(externalSearch ?? '');
  const [openCourse, setOpenCourse] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearchTerm(externalSearch);
    }
  }, [externalSearch]);

  const publishedCourses = useMemo(() => courses.filter(isPublishedCourse), [courses]);

  const filteredCourses = useMemo(
    () => publishedCourses.filter((course) => matchesCourseSearch(course, searchTerm)),
    [publishedCourses, searchTerm],
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchTermChange?.(value);
  };

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

  if (openCourse) {
    return (
      <CoursePlayerView
        courseId={openCourse.id}
        fallbackTitle={openCourse.title}
        backLabel="Volver al catálogo"
        onBack={() => setOpenCourse(null)}
      />
    );
  }

  return (
    <section className="domain-page" aria-labelledby="explore-courses-title">
      <header className="domain-heading">
        <div>
          <h1 id="explore-courses-title">Explorar cursos</h1>
          <p>
            {showEnrollActions
              ? 'Inscríbete o abre un curso para ver sus lecciones.'
              : 'Consulta el catálogo y abre el contenido de cada curso.'}
          </p>
        </div>
      </header>

      {feedback && (
        <p className="domain-alert domain-alert-success" role="status">
          {feedback}
        </p>
      )}

      <div className="domain-toolbar">
        <label className="domain-field" style={{ marginBottom: 0, flex: '1 1 240px' }}>
          <span>Buscar en el catálogo</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Título, categoría, nivel o instructor"
            aria-label="Buscar cursos"
          />
        </label>
      </div>

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
        <div className="domain-state domain-empty">
          <strong>No hay cursos publicados</strong>
          <span>Vuelve más tarde o pide a un instructor que publique contenido.</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <p className="domain-state">Ningún curso coincide con “{searchTerm}”.</p>
      ) : (
        <div className="domain-card-grid">
          {filteredCourses.map((course) => (
            <article key={course.id} className="domain-card">
              <span className="domain-badge domain-badge-category">{course.categoriaNombre}</span>
              <h2 className="domain-card-title">{course.titulo}</h2>
              <p className="domain-card-meta">
                {course.descripcionCorta || 'Sin descripción corta.'}
              </p>
              <p className="domain-card-meta">Instructor: {course.instructorNombre}</p>
              <p className="domain-card-meta">Nivel: {course.nivelNombre}</p>

              <div className="domain-card-actions">
                <button
                  type="button"
                  className="domain-btn-ghost"
                  onClick={() => setOpenCourse({ id: course.id, title: course.titulo })}
                >
                  Ver lecciones
                </button>
                {showEnrollActions && (
                  <button
                    type="button"
                    className="domain-btn-primary"
                    disabled={enrollingCourseId === course.id}
                    onClick={() => void handleEnroll(course)}
                  >
                    {enrollingCourseId === course.id ? 'Inscribiendo…' : 'Inscribirme'}
                  </button>
                )}
              </div>

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
