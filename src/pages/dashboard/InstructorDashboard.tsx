import { useEffect, useMemo, useState } from 'react';
import { getMyCoursesApi } from '../../api/coursesApi';
import { getLessonsApi } from '../../api/lessonsApi';
import { useAuth } from '../../context/AuthContext';
import type { CourseListItem } from '../../types/course';
import '../domain/DomainShared.css';

type InstructorDashboardProps = {
  onNavigate: (section: string, options?: { openCreateCourse?: boolean }) => void;
};

const isPublished = (estado: string) => estado.trim().toLowerCase() === 'publicado';

export const InstructorDashboard = ({ onNavigate }: InstructorDashboardProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const mine = await getMyCoursesApi();
        if (cancelled) return;
        setCourses(mine);

        const countsEntries = await Promise.all(
          mine.slice(0, 12).map(async (course) => {
            try {
              const lessons = await getLessonsApi(course.id);
              return [course.id, lessons.length] as const;
            } catch {
              return [course.id, -1] as const;
            }
          }),
        );

        if (!cancelled) {
          setLessonCounts(Object.fromEntries(countsEntries));
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar tu panel de instructor.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const published = useMemo(() => courses.filter((c) => isPublished(c.estado)).length, [courses]);
  const drafts = courses.length - published;

  const needLessons = useMemo(
    () =>
      courses.filter((course) => {
        const count = lessonCounts[course.id];
        return count === 0;
      }),
    [courses, lessonCounts],
  );

  return (
    <section className="dash-page domain-page" aria-labelledby="instructor-dash-title">
      <header className="domain-heading">
        <div>
          <h1 id="instructor-dash-title">Tus clases, {user?.nombre || 'instructor'}</h1>
          <p>Publica cursos, añade lecciones y revisa qué falta por completar.</p>
        </div>
        <button
          type="button"
          className="domain-btn-primary"
          onClick={() => onNavigate('my-courses', { openCreateCourse: true })}
        >
          Nuevo curso
        </button>
      </header>

      {error && (
        <div className="domain-alert domain-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="dash-stats" aria-busy={isLoading}>
        <article className="dash-stat">
          <p className="dash-stat-label">Total cursos</p>
          <p className="dash-stat-value">{isLoading ? '…' : courses.length}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Publicados</p>
          <p className="dash-stat-value">{isLoading ? '…' : published}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Borradores</p>
          <p className="dash-stat-value">{isLoading ? '…' : drafts}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Sin lecciones</p>
          <p className="dash-stat-value">{isLoading ? '…' : needLessons.length}</p>
        </article>
      </div>

      <section className="dash-section" aria-labelledby="need-lessons-title">
        <h2 id="need-lessons-title">Necesitan lecciones</h2>
        <p>Prioriza estos cursos: todavía no tienen contenido.</p>
        {isLoading ? (
          <p className="domain-state">Cargando…</p>
        ) : needLessons.length === 0 ? (
          <p className="domain-state">Todos tus cursos visibles tienen al menos una lección.</p>
        ) : (
          <div className="dash-list">
            {needLessons.map((course) => (
              <div key={course.id} className="dash-list-item">
                <div>
                  <strong>{course.titulo}</strong>
                  <span>
                    {course.estado} · {course.categoriaNombre}
                  </span>
                </div>
                <button
                  type="button"
                  className="domain-btn-primary"
                  onClick={() => onNavigate('my-courses')}
                >
                  Añadir lecciones
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-section" aria-labelledby="recent-courses-title">
        <h2 id="recent-courses-title">Tus cursos</h2>
        <p>Acceso directo a la gestión de cursos y lecciones.</p>
        {isLoading ? (
          <p className="domain-state">Cargando…</p>
        ) : courses.length === 0 ? (
          <div className="domain-state domain-empty">
            <strong>Aún no tienes cursos</strong>
            <span>Crea el primero y añade lecciones antes de publicar.</span>
            <button
              type="button"
              className="domain-btn-primary"
              onClick={() => onNavigate('my-courses', { openCreateCourse: true })}
            >
              Crear curso
            </button>
          </div>
        ) : (
          <div className="dash-list">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="dash-list-item">
                <div>
                  <strong>{course.titulo}</strong>
                  <span>
                    {course.estado}
                    {lessonCounts[course.id] != null && lessonCounts[course.id] >= 0
                      ? ` · ${lessonCounts[course.id]} lecciones`
                      : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="domain-btn-ghost"
                  onClick={() => onNavigate('my-courses')}
                >
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Accesos rápidos</h2>
        <div className="dash-quick-links">
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('my-courses')}>
            Mis cursos
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('reports')}>
            Reportes
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('explore')}>
            Explorar
          </button>
        </div>
      </section>
    </section>
  );
};
