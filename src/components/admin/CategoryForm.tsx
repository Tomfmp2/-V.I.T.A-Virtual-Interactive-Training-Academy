import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FieldError } from '../auth/FieldError';
import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_ICON_URL_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
} from '../../types/category';
import type { Category, CategoryRequest } from '../../types/category';

interface CategoryFormProps {
  /** Categoría en edición; `null` significa alta nueva. */
  category: Category | null;
  isSaving: boolean;
  saveError: string;
  onSubmit: (values: CategoryRequest) => void;
  onCancel: () => void;
}

export const CategoryForm = ({
  category,
  isSaving,
  saveError,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const [nombre, setNombre] = useState(category?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(category?.descripcion ?? '');
  const [iconoUrl, setIconoUrl] = useState(category?.iconoUrl ?? '');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    setNombre(category?.nombre ?? '');
    setDescripcion(category?.descripcion ?? '');
    setIconoUrl(category?.iconoUrl ?? '');
    setNameError('');
  }, [category]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Mismas reglas que CategoryRequest en el backend, para no gastar un 400.
    const trimmedName = nombre.trim();
    if (!trimmedName) {
      setNameError('El nombre es obligatorio.');
      return;
    }
    if (trimmedName.length < CATEGORY_NAME_MIN_LENGTH) {
      setNameError(`El nombre debe tener al menos ${CATEGORY_NAME_MIN_LENGTH} caracteres.`);
      return;
    }
    if (trimmedName.length > CATEGORY_NAME_MAX_LENGTH) {
      setNameError(`El nombre no puede superar los ${CATEGORY_NAME_MAX_LENGTH} caracteres.`);
      return;
    }

    setNameError('');
    onSubmit({
      nombre: trimmedName,
      descripcion: descripcion.trim() || null,
      iconoUrl: iconoUrl.trim() || null,
    });
  };

  return (
    <form className="category-form" onSubmit={handleSubmit} noValidate>
      <h2>{category ? 'Editar categoría' : 'Nueva categoría'}</h2>

      <label className="category-field">
        <span>Nombre</span>
        <input
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value);
            setNameError('');
          }}
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          aria-invalid={Boolean(nameError)}
          disabled={isSaving}
          autoFocus
        />
        <FieldError>{nameError}</FieldError>
      </label>

      <label className="category-field">
        <span>Descripción <small>(opcional)</small></span>
        <textarea
          value={descripcion ?? ''}
          onChange={(event) => setDescripcion(event.target.value)}
          maxLength={CATEGORY_DESCRIPTION_MAX_LENGTH}
          rows={3}
          disabled={isSaving}
        />
      </label>

      <label className="category-field">
        <span>URL del icono <small>(opcional)</small></span>
        <input
          value={iconoUrl ?? ''}
          onChange={(event) => setIconoUrl(event.target.value)}
          maxLength={CATEGORY_ICON_URL_MAX_LENGTH}
          placeholder="https://…"
          disabled={isSaving}
        />
      </label>

      {saveError && (
        <p className="category-alert category-alert-error" role="alert">
          {saveError}
        </p>
      )}

      <div className="category-form-actions">
        <button type="button" className="category-btn-ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </button>
        <button type="submit" className="category-btn-primary" disabled={isSaving}>
          {isSaving ? 'Guardando…' : category ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  );
};
