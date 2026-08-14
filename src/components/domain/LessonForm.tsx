import type { FormEvent } from 'react';
import type { LessonRequest } from '../../types/lesson';
import '../../pages/domain/DomainShared.css';

export type LessonFormProps = {
  mode: 'create' | 'edit';
  value: LessonRequest;
  error: string;
  isSaving: boolean;
  onChange: (next: LessonRequest) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export const LessonForm = ({
  mode,
  value,
  error,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: LessonFormProps) => {
  return (
    <form className="domain-form lesson-form" onSubmit={onSubmit}>
      <h2>{mode === 'create' ? 'Crear lección' : 'Editar lección'}</h2>

      <label className="domain-field">
        <span>Título</span>
        <input
          type="text"
          required
          minLength={3}
          value={value.titulo}
          onChange={(event) => onChange({ ...value, titulo: event.target.value })}
        />
      </label>

      <div className="domain-form-grid">
        <label className="domain-field">
          <span>Orden</span>
          <input
            type="number"
            required
            min={1}
            value={value.orden}
            onChange={(event) =>
              onChange({ ...value, orden: Number(event.target.value) || 1 })
            }
          />
        </label>

        <label className="domain-field">
          <span>
            Recurso <small>(video, imagen o YouTube/Vimeo)</small>
          </span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://…/video.mp4 · imagen.jpg · youtube.com/…"
            value={value.recurso ?? ''}
            onChange={(event) => onChange({ ...value, recurso: event.target.value })}
          />
        </label>
      </div>

      <label className="domain-field">
        <span>Descripción</span>
        <textarea
          rows={3}
          value={value.descripcion ?? ''}
          onChange={(event) => onChange({ ...value, descripcion: event.target.value })}
        />
      </label>

      {error && (
        <p className="domain-inline-error" role="alert">
          {error}
        </p>
      )}

      <div className="domain-form-actions">
        <button type="button" className="domain-btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="domain-btn-primary" disabled={isSaving}>
          {isSaving ? 'Guardando…' : mode === 'create' ? 'Crear lección' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};
