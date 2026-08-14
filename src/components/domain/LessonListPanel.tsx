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
  compact?: boolean;
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
  compact = false,
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
    if (!compact) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [courseTitle, compact]);

  return (
    <section
      ref={panelRef}
      className={`domain-section lesson-panel ${compact ? 'is-compact' : ''}`}
      aria-labelledby="lessons-section-title"
    >
      <div className="lesson-panel-sticky">
        <div className="domain-toolbar">
          <div>
            {!compact && <p className="lesson-panel-eyebrow">Lecciones</p>}
            <h2 id="lessons-section-title">
              {compact ? `Lecciones · ${lessons.length}` : courseTitle}
            </h2>
          </div>
          <div className="domain-row-actions">
            {!compact && (
              <button type="button" className="domain-btn-ghost" onClick={onClosePanel}>
                Cerrar
              </button>
            )}
            <button
              type="button"
              className="domain-btn-primary"
              onClick={onOpenCreate}
              disabled={isFormOpen && formMode === 'create'}
            >
              {lessons.length === 0 ? 'Primera lección' : 'Nueva lección'}
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
          <strong>Sin lecciones todavía</strong>
          <span>Añade la primera para completar el curso.</span>
          {!isFormOpen && (
            <button type="button" className="domain-btn-primary" onClick={onOpenCreate}>
              Crear lección
            </button>
          )}
        </div>
      ) : (
        <ul className="lesson-row-list">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="lesson-row">
              <span className="lesson-row-orden">{lesson.orden}</span>
              <div className="lesson-row-body">
                <strong>{lesson.titulo}</strong>
                {lesson.descripcion ? <span>{lesson.descripcion}</span> : null}
                {lesson.recurso ? (
                  <a href={lesson.recurso} target="_blank" rel="noreferrer">
                    {lesson.recurso}
                  </a>
                ) : null}
              </div>
              <div className="lesson-row-actions">
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
                  {deletingLessonId === lesson.id ? '…' : 'Eliminar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
