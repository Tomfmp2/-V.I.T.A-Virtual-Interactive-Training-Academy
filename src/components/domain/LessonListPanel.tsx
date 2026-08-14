import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { LessonForm } from './LessonForm';
import type { Lesson, LessonRequest } from '../../types/lesson';
import '../../pages/domain/DomainShared.css';

export type LessonListPanelProps = {
  courseTitle: string;
  lessons: Lesson[];
  isLoading: boolean;
  error: string;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  formValue: LessonRequest;
  formError: string;
  isSaving: boolean;
  deletingLessonId: number | null;
  onRetry: () => void;
  onClosePanel: () => void;
  onOpenCreate: () => void;
  onFormChange: (next: LessonRequest) => void;
  onFormCancel: () => void;
  onFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
};

export const LessonListPanel = ({
  courseTitle,
  lessons,
  isLoading,
  error,
  isFormOpen,
  formMode,
  formValue,
  formError,
  isSaving,
  deletingLessonId,
  onRetry,
  onClosePanel,
  onOpenCreate,
  onFormChange,
  onFormCancel,
  onFormSubmit,
  onEditLesson,
  onDeleteLesson,
}: LessonListPanelProps) => {
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [courseTitle]);

  return (
    <section
      ref={panelRef}
      className="domain-section lesson-panel"
      aria-labelledby="lessons-section-title"
    >
      <div className="lesson-panel-sticky">
        <div className="domain-toolbar">
          <div>
            <p className="lesson-panel-eyebrow">Lecciones del curso</p>
            <h2 id="lessons-section-title">{courseTitle}</h2>
          </div>
          <div className="domain-row-actions">
            <button type="button" className="domain-btn-ghost" onClick={onClosePanel}>
              Cerrar panel
            </button>
            <button
              type="button"
              className="domain-btn-primary"
              onClick={onOpenCreate}
              disabled={isFormOpen && formMode === 'create'}
            >
              {lessons.length === 0 ? 'Crear primera lección' : 'Nueva lección'}
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <LessonForm
          mode={formMode}
          value={formValue}
          error={formError}
          isSaving={isSaving}
          onChange={onFormChange}
          onSubmit={onFormSubmit}
          onCancel={onFormCancel}
        />
      )}

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando lecciones…
        </p>
      ) : error ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" className="domain-btn-ghost" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : lessons.length === 0 ? (
        <div className="domain-state domain-empty">
          <strong>Este curso aún no tiene lecciones</strong>
          <span>Crea la primera para que el contenido quede listo antes de publicar.</span>
          {!isFormOpen && (
            <button type="button" className="domain-btn-primary" onClick={onOpenCreate}>
              Crear primera lección
            </button>
          )}
        </div>
      ) : (
        <div className="domain-table-wrapper">
          <table className="domain-table">
            <thead>
              <tr>
                <th scope="col">Orden</th>
                <th scope="col">Título</th>
                <th scope="col">Recurso</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td>{lesson.orden}</td>
                  <td>
                    <div className="lesson-title-cell">
                      <strong>{lesson.titulo}</strong>
                      {lesson.descripcion ? (
                        <span className="domain-card-meta">{lesson.descripcion}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {lesson.recurso ? (
                      <a
                        className="lesson-resource-link"
                        href={lesson.recurso}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir recurso
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="domain-row-actions">
                      <button
                        type="button"
                        className="domain-btn-ghost"
                        onClick={() => onEditLesson(lesson)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="domain-btn-danger"
                        disabled={deletingLessonId === lesson.id}
                        onClick={() => onDeleteLesson(lesson)}
                      >
                        {deletingLessonId === lesson.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
