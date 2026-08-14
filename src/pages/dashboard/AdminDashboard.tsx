import { useEffect, useMemo, useState } from 'react';
import { getCategoriesApi } from '../../api/categoriesApi';
import { getCoursesApi } from '../../api/coursesApi';
import { getTopCoursesReportApi } from '../../api/reportsApi';
import { getUsersApi } from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';
import type { Category } from '../../types/category';
import type { CourseListItem } from '../../types/course';
import type { TopCourseItem } from '../../types/report';
import type { AdminUser } from '../../types/user';
import '../domain/DomainShared.css';

type AdminDashboardProps = {
  onNavigate: (section: string) => void;
};

export const AdminDashboard = ({ onNavigate }: AdminDashboardProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [usersData, coursesData, categoriesData, topData] = await Promise.all([
          getUsersApi(),
          getCoursesApi(),
          getCategoriesApi(),
          getTopCoursesReportApi(5),
        ]);
        if (!cancelled) {
          setUsers(usersData);
          setCourses(coursesData);
          setCategories(categoriesData);
          setTopCourses(topData);
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el panel de administración.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const drafts = useMemo(
    () => courses.filter((course) => course.estado.trim().toLowerCase() === 'borrador').length,
    [courses],
  );

  const topEnrollments = topCourses[0]?.totalInscritos ?? 0;

  return (
    <section className="dash-page domain-page" aria-labelledby="admin-dash-title">
      <header className="domain-heading">
        <div>
          <h1 id="admin-dash-title">Panel plataforma</h1>
          <p>
            Hola {user?.nombre || 'Admin'}. Vista rápida de usuarios, catálogo y reportes.
          </p>
        </div>
        <button type="button" className="domain-btn-primary" onClick={() => onNavigate('reports')}>
          Ver reportes
        </button>
      </header>

      {error && (
        <div className="domain-alert domain-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="dash-stats" aria-busy={isLoading}>
        <article className="dash-stat">
          <p className="dash-stat-label">Usuarios</p>
          <p className="dash-stat-value">{isLoading ? '…' : users.length}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Cursos</p>
          <p className="dash-stat-value">{isLoading ? '…' : courses.length}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Categorías</p>
          <p className="dash-stat-value">{isLoading ? '…' : categories.length}</p>
        </article>
        <article className="dash-stat">
          <p className="dash-stat-label">Top inscritos</p>
          <p className="dash-stat-value">{isLoading ? '…' : topEnrollments}</p>
        </article>
      </div>

      <section className="dash-section" aria-labelledby="admin-health-title">
        <h2 id="admin-health-title">Salud del catálogo</h2>
        <p>Cursos en borrador que aún no están visibles para estudiantes.</p>
        <div className="dash-list-item">
          <div>
            <strong>{isLoading ? '…' : drafts} cursos en borrador</strong>
            <span>Revisa con instructores antes de la demo.</span>
          </div>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('my-courses')}>
            Ir a cursos
          </button>
        </div>
      </section>

      <section className="dash-section" aria-labelledby="admin-top-title">
        <h2 id="admin-top-title">Top cursos por inscripción</h2>
        <p>Snapshot del reporte M8 (limit 5).</p>
        {isLoading ? (
          <p className="domain-state">Cargando…</p>
        ) : topCourses.length === 0 ? (
          <p className="domain-state">Todavía no hay inscripciones para reportar.</p>
        ) : (
          <div className="domain-table-wrapper">
            <table className="domain-table">
              <thead>
                <tr>
                  <th scope="col">Curso</th>
                  <th scope="col">Instructor</th>
                  <th scope="col">Inscritos</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((item) => (
                  <tr key={item.cursoId}>
                    <td>{item.titulo}</td>
                    <td>{item.instructor}</td>
                    <td>{item.totalInscritos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Accesos rápidos</h2>
        <div className="dash-quick-links">
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('users')}>
            Usuarios
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('categories')}>
            Categorías
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('my-courses')}>
            Cursos
          </button>
          <button type="button" className="domain-btn-ghost" onClick={() => onNavigate('reports')}>
            Reportes
          </button>
        </div>
      </section>
    </section>
  );
};
