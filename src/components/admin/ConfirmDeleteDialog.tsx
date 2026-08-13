import { useEffect } from 'react';
import type { Category } from '../../types/category';

interface ConfirmDeleteDialogProps {
  category: Category;
  isDeleting: boolean;
  /** Mensaje del backend (409 incluido). Mantiene el diálogo abierto. */
  deleteError: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteDialog = ({
  category,
  isDeleting,
  deleteError,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onCancel();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isDeleting, onCancel]);

  return (
    <div className="category-dialog-backdrop">
      <div
        className="category-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <h2 id="delete-dialog-title">Eliminar categoría</h2>

        <p id="delete-dialog-description">
          ¿Seguro que quieres eliminar <strong>{category.nombre}</strong>? Esta acción no se puede
          deshacer.
        </p>

        {deleteError && (
          <p className="category-alert category-alert-error" role="alert">
            {deleteError}
          </p>
        )}

        <div className="category-form-actions">
          <button type="button" className="category-btn-ghost" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button
            type="button"
            className="category-btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
