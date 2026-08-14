import { useCallback, useEffect, useState } from 'react';
import { getMyEnrollmentsApi } from '../../api/enrollmentsApi';
import type { Enrollment } from '../../types/enrollment';
import './DomainShared.css';

const formatEnrollmentDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const MyEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getMyEnrollmentsApi();
      setEnrollments(data);
    } catch {
      setLoadError('No se pudieron cargar tus inscripciones. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEnrollments();
  }, [loadEnrollments]);

  return (
    <section className="domain-page" aria-labelledby="my-enrollments-title">
      <header className="domain-heading">
        <div>
          <h1 id="my-enrollments-title">Mis inscripciones</h1>
          <p>Consulta los cursos en los que estás inscrito.</p>
        </div>
      </header>

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando inscripciones…
        </p>
      ) : loadError ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="domain-btn-ghost" onClick={() => void loadEnrollments()}>
            Reintentar
          </button>
        </div>
      ) : enrollments.length === 0 ? (
        <p className="domain-state">
          Todavía no tienes inscripciones. Explora el catálogo para empezar.
        </p>
      ) : (
        <div className="domain-card-grid">
          {enrollments.map((enrollment) => (
            <article key={enrollment.id} className="domain-card">
              <h2 className="domain-card-title">{enrollment.cursoTitulo}</h2>
              <p className="domain-card-meta">
                Inscripción: {formatEnrollmentDate(enrollment.fechaInscripcion)}
              </p>
              <p className="domain-card-meta">
                Estado:{' '}
                <span className="domain-badge domain-badge-success">{enrollment.estado}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
