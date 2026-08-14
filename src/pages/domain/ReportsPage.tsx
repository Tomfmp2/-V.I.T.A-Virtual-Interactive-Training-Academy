import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getCoursesByInstructorReportApi,
  getStudentsByCourseReportApi,
  getTopCoursesReportApi,
} from '../../api/reportsApi';
import { isAdminRole, isInstructorRole } from '../../utils/coursePermissions';
import type {
  CoursesByInstructorItem,
  StudentsByCourseItem,
  TopCourseItem,
} from '../../types/report';
import './DomainShared.css';

export const ReportsPage = () => {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.rol);
  const isInstructor = isInstructorRole(user?.rol);
  const canViewReports = isAdmin || isInstructor;

  const [coursesByInstructor, setCoursesByInstructor] = useState<CoursesByInstructorItem[]>([]);
  const [studentsByCourse, setStudentsByCourse] = useState<StudentsByCourseItem[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadReports = useCallback(async () => {
    if (!canViewReports) return;

    setIsLoading(true);
    setLoadError('');

    try {
      if (isAdmin) {
        const [byInstructor, byCourse, top] = await Promise.all([
          getCoursesByInstructorReportApi(),
          getStudentsByCourseReportApi(),
          getTopCoursesReportApi(),
        ]);
        setCoursesByInstructor(byInstructor);
        setStudentsByCourse(byCourse);
        setTopCourses(top);
      } else {
        const byCourse = await getStudentsByCourseReportApi();
        setStudentsByCourse(byCourse);
      }
    } catch {
      setLoadError('No se pudieron cargar los reportes. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [canViewReports, isAdmin]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  if (!canViewReports) {
    return (
      <section className="domain-page" aria-labelledby="reports-title">
        <h1 id="reports-title">Reportes</h1>
        <div className="domain-alert domain-alert-error" role="alert">
          <strong>Acceso no permitido</strong>
          <span>No tienes permisos para realizar esta acción.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="domain-page" aria-labelledby="reports-title">
      <header className="domain-heading">
        <div>
          <h1 id="reports-title">Reportes</h1>
          <p>
            {isAdmin
              ? 'Resumen de cursos por instructor, estudiantes por curso y cursos más populares.'
              : 'Estudiantes inscritos por curso.'}
          </p>
        </div>
      </header>

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando reportes…
        </p>
      ) : loadError ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="domain-btn-ghost" onClick={() => void loadReports()}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {isAdmin && (
            <section className="domain-section" aria-labelledby="report-instructors-title">
              <h2 id="report-instructors-title">Cursos por instructor</h2>
              {coursesByInstructor.length === 0 ? (
                <p className="domain-state">Sin datos para mostrar.</p>
              ) : (
                <div className="domain-table-wrapper">
                  <table className="domain-table">
                    <thead>
                      <tr>
                        <th scope="col">Instructor</th>
                        <th scope="col">Total cursos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesByInstructor.map((item) => (
                        <tr key={item.instructorId}>
                          <td>{item.instructor}</td>
                          <td>{item.totalCursos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <section className="domain-section" aria-labelledby="report-students-title">
            <h2 id="report-students-title">Estudiantes por curso</h2>
            {studentsByCourse.length === 0 ? (
              <p className="domain-state">Sin datos para mostrar.</p>
            ) : (
              <div className="domain-table-wrapper">
                <table className="domain-table">
                  <thead>
                    <tr>
                      <th scope="col">Curso</th>
                      <th scope="col">Total estudiantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsByCourse.map((item) => (
                      <tr key={item.cursoId}>
                        <td>{item.titulo}</td>
                        <td>{item.totalEstudiantes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {isAdmin && (
            <section className="domain-section" aria-labelledby="report-top-title">
              <h2 id="report-top-title">Cursos más populares</h2>
              {topCourses.length === 0 ? (
                <p className="domain-state">Sin datos para mostrar.</p>
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
          )}
        </>
      )}
    </section>
  );
};
