import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyEnrollmentsApi } from '../../api/enrollmentsApi';
import { CoursePlayerView } from '../../components/domain/CoursePlayerView';
import { matchesTextSearch } from '../../utils/courseSearch';
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

export interface MyEnrollmentsPageProps {
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
}

export const MyEnrollmentsPage = ({
  searchTerm: externalSearch,
  onSearchTermChange,
}: MyEnrollmentsPageProps = {}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState(externalSearch ?? '');
  const [openCourse, setOpenCourse] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearchTerm(externalSearch);
    }
  }, [externalSearch]);

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

  const filteredEnrollments = useMemo(
    () =>
      enrollments.filter(
        (item) =>
          matchesTextSearch(item.cursoTitulo, searchTerm) ||
          matchesTextSearch(item.estado, searchTerm),
      ),
    [enrollments, searchTerm],
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchTermChange?.(value);
  };

  if (openCourse) {
    return (
      <CoursePlayerView
        courseId={openCourse.id}
        fallbackTitle={openCourse.title}
        backLabel="Volver a mis cursos"
        onBack={() => setOpenCourse(null)}
      />
    );
  }

  return (
    <section className="domain-page" aria-labelledby="my-enrollments-title">
      <header className="domain-heading">
        <div>
          <h1 id="my-enrollments-title">Mis inscripciones</h1>
          <p>Abre un curso para ver lecciones y continuar aprendiendo.</p>
        </div>
      </header>

      <div className="domain-toolbar">
        <label className="domain-field" style={{ marginBottom: 0, flex: '1 1 240px' }}>
          <span>Buscar inscripción</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Título del curso o estado"
            aria-label="Buscar en mis inscripciones"
          />
        </label>
      </div>

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
        <div className="domain-state domain-empty">
          <strong>Todavía no tienes inscripciones</strong>
          <span>Explora el catálogo para empezar.</span>
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <p className="domain-state">Ninguna inscripción coincide con “{searchTerm}”.</p>
      ) : (
        <div className="domain-card-grid">
          {filteredEnrollments.map((enrollment) => (
            <article key={enrollment.id} className="domain-card domain-card-clickable">
              <h2 className="domain-card-title">{enrollment.cursoTitulo}</h2>
              <p className="domain-card-meta">
                Inscripción: {formatEnrollmentDate(enrollment.fechaInscripcion)}
              </p>
              <p className="domain-card-meta">
                Estado:{' '}
                <span className="domain-badge domain-badge-success">{enrollment.estado}</span>
              </p>
              <div className="domain-card-actions">
                <button
                  type="button"
                  className="domain-btn-primary"
                  onClick={() =>
                    setOpenCourse({ id: enrollment.cursoId, title: enrollment.cursoTitulo })
                  }
                >
                  Abrir curso
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
