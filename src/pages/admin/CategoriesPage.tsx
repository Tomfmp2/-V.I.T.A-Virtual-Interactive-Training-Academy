import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { createCategoryApi, deleteCategoryApi, updateCategoryApi } from '../../api/categoriesApi';
import { getCoursePermissions } from '../../utils/coursePermissions';
import { resolveDeleteCategoryError, resolveSaveCategoryError } from '../../utils/apiErrors';
import { CategoryForm } from '../../components/admin/CategoryForm';
import { ConfirmDeleteDialog } from '../../components/admin/ConfirmDeleteDialog';
import type { Category, CategoryRequest } from '../../types/category';
import './CategoriesPage.css';

export const CategoriesPage = () => {
  const { user } = useAuth();
  const { manageCategory } = getCoursePermissions(user?.rol);
  const { categories, isLoading, loadError, refetch } = useCategories(manageCategory);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  /** Categorías que el backend rechazó con 409; siguen visibles y marcadas. */
  const [blockedCategoryIds, setBlockedCategoryIds] = useState<number[]>([]);

  const [feedback, setFeedback] = useState('');

  if (!manageCategory) {
    return (
      <section className="categories-page" aria-labelledby="categories-title">
        <h1 id="categories-title">Categorías</h1>
        <div className="category-alert category-alert-error" role="alert">
          <strong>Acceso no permitido</strong>
          <span>No tienes permisos para realizar esta acción.</span>
        </div>
      </section>
    );
  }

  const openCreateForm = () => {
    setEditingCategory(null);
    setSaveError('');
    setFeedback('');
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setSaveError('');
    setFeedback('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setSaveError('');
  };

  const handleSubmit = async (values: CategoryRequest) => {
    setIsSaving(true);
    setSaveError('');

    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, values);
        setFeedback(`Categoría "${values.nombre}" actualizada.`);
      } else {
        await createCategoryApi(values);
        setFeedback(`Categoría "${values.nombre}" creada.`);
      }

      closeForm();
      await refetch();
    } catch (error) {
      setSaveError(resolveSaveCategoryError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const askDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteError('');
    setFeedback('');
  };

  const cancelDelete = () => {
    setCategoryToDelete(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteCategoryApi(categoryToDelete.id);

      // Solo tras un 2xx se retira la categoría de la vista, y siempre releyendo del servidor.
      setBlockedCategoryIds((current) => current.filter((id) => id !== categoryToDelete.id));
      setFeedback(`Categoría "${categoryToDelete.nombre}" eliminada.`);
      setCategoryToDelete(null);
      await refetch();
    } catch (error) {
      // La categoría permanece en la lista: el borrado nunca es silencioso.
      const message = resolveDeleteCategoryError(error);
      setDeleteError(message);

      setBlockedCategoryIds((current) =>
        current.includes(categoryToDelete.id) ? current : [...current, categoryToDelete.id],
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="categories-page" aria-labelledby="categories-title">
      <header className="categories-heading">
        <div>
          <h1 id="categories-title">Categorías</h1>
          <p>Crea, edita y elimina las categorías del catálogo de cursos.</p>
        </div>
        <button type="button" className="category-btn-primary" onClick={openCreateForm}>
          Nueva categoría
        </button>
      </header>

      {feedback && (
        <p className="category-alert category-alert-success" role="status">
          {feedback}
        </p>
      )}

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          isSaving={isSaving}
          saveError={saveError}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {isLoading ? (
        <p className="categories-state" role="status">
          Cargando categorías…
        </p>
      ) : loadError ? (
        <div className="category-alert category-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="category-btn-ghost" onClick={() => void refetch()}>
            Reintentar
          </button>
        </div>
      ) : categories.length === 0 ? (
        <p className="categories-state">
          Todavía no hay categorías. Crea la primera para clasificar los cursos.
        </p>
      ) : (
        <div className="categories-table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <span className="category-name">{category.nombre}</span>
                    {blockedCategoryIds.includes(category.id) && (
                      <span className="category-badge-blocked" title="No se puede borrar: categoría en uso">
                        En uso
                      </span>
                    )}
                  </td>
                  <td className="category-description">{category.descripcion || '—'}</td>
                  <td>
                    <div className="category-row-actions">
                      <button
                        type="button"
                        className="category-btn-ghost"
                        onClick={() => openEditForm(category)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="category-btn-danger"
                        onClick={() => askDelete(category)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {categoryToDelete && (
        <ConfirmDeleteDialog
          category={categoryToDelete}
          isDeleting={isDeleting}
          deleteError={deleteError}
          onConfirm={() => void confirmDelete()}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
};
