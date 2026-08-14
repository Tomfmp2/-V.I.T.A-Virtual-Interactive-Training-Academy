import { useEffect, useMemo, useState } from 'react';
import { getCoursesApi } from '../../api/coursesApi';
import { getMyEnrollmentsApi } from '../../api/enrollmentsApi';
import { useAuth } from '../../context/AuthContext';
import type { CourseListItem } from '../../types/course';
import type { Enrollment } from '../../types/enrollment';
import '../domain/DomainShared.css';

type StudentDashboardProps = {
  onNavigate: (section: string) => void;
};

export const StudentDashboard = ({ onNavigate }: StudentDashboardProps) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [mine, catalog] = await Promise.all([getMyEnrollmentsApi(), getCoursesApi()]);
        if (!cancelled) {
          setEnrollments(mine);
          setCourses(catalog);
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar tu resumen. Intenta de nuevo.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => item.estado.toLowerCase() === 'activa'),
    [enrollments],
  );

  const enrolledIds = useMemo(
    () => new Set(activeEnrollments.map((item) => item.cursoId)),
    [activeEnrollments],
  );

  const recommended = useMemo(
    () => courses.filter((course) => !enrolledIds.has(course.id)).slice(0, 4),
    [courses, enrolledIds],
  );

  const categoriesTouched = useMemo(() => {
    const titles = new Set(
      activeEnrollments
        .map((item) => courses.find((course) => course.id === item.cursoId)?.categoriaNombre)
        .filter(Boolean),
    );
    return titles.size;
  }, [activeEnrollments, courses]);

  return (
    <section className="dash-page domain-page" aria-labelledby="student-dash-title">
      <header className="domain-heading">
        <div>
          <h1 id="student-dash-title">Continúa aprendiendo, {user?.nombre || 'estudiante'}</h1>
          <p>Resumen de tus inscripciones y cursos disponibles en VITA.</p>
        </div>
        <button type="button" className="domain-btn-primary" onClick={() => onNavigate('explore')}>
          Explorar catálogo
        </button>
      </header>

      {error && (
        <div className="domain-alert domain-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="dash-stats" aria-busy={isLoading}>
        <article className="dash-stat">
          <p className="dash-stat-label">Inscripciones activas</p>
          <p className="dash-stat-value">{isLoading ? '…' : activeEnrollments.length}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Cursos publicados</p>
          <p className="dash-stat-value">{isLoading ? '…' : courses.length}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Categorías en tus cursos</p>
          <p className="dash-stat-value">{isLoading ? '…' : categoriesTouched}</p>
        </article>
      </div>

      <section className="dash-section" aria-labelledby="student-mine-title">
        <h2 id="student-mine-title">Mis cursos</h2>
        <p>Acceso rápido a tus inscripciones más recientes.</p>
        {isLoading ? (
          <p className="domain-state">Cargando…</p>
        ) : activeEnrollments.length === 0 ? (
          <div className="domain-state domain-empty">
            <strong>Aún no estás inscrito</strong>
            <span>Explora el catálogo y únete a un curso publicado.</span>
            <button type="button" className="domain-btn-primary" onClick={() => onNavigate('explore')}>
              Ir a explorar
            </button>
          </div>
        ) : (
          <div className="dash-list">
            {activeEnrollments.slice(0, 4).map((item) => (
              <div key={item.id} className="dash-list-item">
                <div>
                  <strong>{item.cursoTitulo}</strong>
                  <span>Estado: {item.estado}</span>
                </div>
                <button
                  type="button"
                  className="domain-btn-ghost"
                  onClick={() => onNavigate('my-courses')}
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-section" aria-labelledby="student-reco-title">
        <h2 id="student-reco-title">Recomendados para ti</h2>
        <p>Cursos publicados en los que todavía no estás inscrito.</p>
        {isLoading ? (
          <p className="domain-state">Cargando…</p>
        ) : recommended.length === 0 ? (
          <p className="domain-state">Ya estás en todos los cursos publicados disponibles.</p>
        ) : (
          <div className="dash-list">
            {recommended.map((course) => (
              <div key={course.id} className="dash-list-item">
                <div>
                  <strong>{course.titulo}</strong>
                  <span>
                    {course.categoriaNombre} · {course.nivelNombre}
                  </span>
                </div>
                <button
                  type="button"
                  className="domain-btn-primary"
                  onClick={() => onNavigate('explore')}
                >
                  Inscribirme
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Accesos rápidos</h2>
        <div className="dash-quick-links">
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('explore')}>
            Explorar catálogo
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('my-courses')}>
            Mis inscripciones
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('settings')}>
            Perfil
          </button>
        </div>
      </section>
    </section>
  );
};
