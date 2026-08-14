import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCategoriesApi } from '../../api/categoriesApi';
import { getLevelsApi } from '../../api/levelsApi';
import {
  changeCourseStatusApi,
  createCourseApi,
  deleteCourseApi,
  getCoursesApi,
  getMyCoursesApi,
  updateCourseApi,
} from '../../api/coursesApi';
import {
  createLessonApi,
  deleteLessonApi,
  getLessonsApi,
  updateLessonApi,
} from '../../api/lessonsApi';
import { getUsersApi } from '../../api/usersApi';
import { LessonListPanel } from '../../components/domain/LessonListPanel';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { isAdminRole, normalizePlatformRole } from '../../utils/coursePermissions';
import type { Category } from '../../types/category';
import type {
  CourseAdminCreateRequest,
  CourseCreateRequest,
  CourseListItem,
  CourseUpdateRequest,
} from '../../types/course';
import type { Level } from '../../types/level';
import type { Lesson, LessonRequest } from '../../types/lesson';
import type { AdminUser } from '../../types/user';
import './DomainShared.css';
import './ManageCoursesPage.css';

export interface ManageCoursesPageProps {
  variant: 'instructor' | 'admin';
  /** Si viene desde el dashboard, abre el form de nuevo curso al montar */
  initialOpenCreate?: boolean;
}

type CourseFormState = {
  titulo: string;
  descripcionCorta: string;
  idCategoria: string;
  idNivel: string;
  idInstructor: string;
};

const emptyCourseForm: CourseFormState = {
  titulo: '',
  descripcionCorta: '',
  idCategoria: '',
  idNivel: '',
  idInstructor: '',
};

const emptyLessonForm: LessonRequest = {
  titulo: '',
  descripcion: '',
  recurso: '',
  orden: 1,
};

const isInstructorUser = (userItem: AdminUser): boolean =>
  normalizePlatformRole(userItem.rol) === 'instructor';

const normalizeCourseStatus = (estado: string): string => estado.trim().toLowerCase();

const nextLessonOrden = (lessons: Lesson[]): number =>
  lessons.reduce((max, lesson) => Math.max(max, lesson.orden), 0) + 1;

export const ManageCoursesPage = ({
  variant,
  initialOpenCreate = false,
}: ManageCoursesPageProps) => {
  const { user } = useAuth();
  const platformRole = normalizePlatformRole(user?.rol);
  const isAdminVariant = variant === 'admin';
  const canAccess =
    (isAdminVariant && isAdminRole(user?.rol)) ||
    (variant === 'instructor' && (platformRole === 'instructor' || platformRole === 'admin'));

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [instructors, setInstructors] = useState<AdminUser[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'publicado' | 'borrador'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(initialOpenCreate);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormState>(emptyCourseForm);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseSaveError, setCourseSaveError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [lessonFormMode, setLessonFormMode] = useState<'create' | 'edit'>('create');
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonRequest>(emptyLessonForm);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [lessonSaveError, setLessonSaveError] = useState('');
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState('');
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const filteredCourses = useMemo(() => {
    if (statusFilter === 'all') return courses;
    return courses.filter(
      (course) => normalizeCourseStatus(course.estado) === statusFilter,
    );
  }, [courses, statusFilter]);

  const publishedCount = useMemo(
    () => courses.filter((course) => normalizeCourseStatus(course.estado) === 'publicado').length,
    [courses],
  );

  const draftCount = courses.length - publishedCount;

  const loadCourses = useCallback(async () => {
    if (!canAccess) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const data = isAdminVariant ? await getCoursesApi() : await getMyCoursesApi();
      setCourses(data);
    } catch {
      setLoadError('No se pudieron cargar los cursos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, isAdminVariant]);

  const loadCatalogData = useCallback(async () => {
    if (!canAccess) return;

    try {
      const [categoriesData, levelsData] = await Promise.all([
        getCategoriesApi(),
        getLevelsApi(),
      ]);
      setCategories(categoriesData);
      setLevels(levelsData);

      if (isAdminVariant) {
        const usersData = await getUsersApi();
        setInstructors(usersData.filter(isInstructorUser));
      }
    } catch {
      setLoadError('No se pudieron cargar categorías o niveles.');
    }
  }, [canAccess, isAdminVariant]);

  const loadLessons = useCallback(async (courseId: number) => {
    setIsLoadingLessons(true);
    setLessonsError('');

    try {
      const data = await getLessonsApi(courseId);
      setLessons(data);
    } catch {
      setLessonsError('No se pudieron cargar las lecciones del curso.');
      setLessons([]);
    } finally {
      setIsLoadingLessons(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
    void loadCatalogData();
  }, [loadCourses, loadCatalogData]);

  useEffect(() => {
    if (selectedCourseId == null) {
      setLessons([]);
      setIsLessonFormOpen(false);
      setEditingLessonId(null);
      return;
    }

    void loadLessons(selectedCourseId);
  }, [selectedCourseId, loadLessons]);

  if (!canAccess) {
    return (
      <section className="domain-page" aria-labelledby="manage-courses-title">
        <h1 id="manage-courses-title">{isAdminVariant ? 'Cursos' : 'Mis cursos'}</h1>
        <div className="domain-alert domain-alert-error" role="alert">
          <strong>Acceso no permitido</strong>
          <span>No tienes permisos para realizar esta acción.</span>
        </div>
      </section>
    );
  }

  const openCreateCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm(emptyCourseForm);
    setIsCourseFormOpen(true);
    setCourseSaveError('');
  };

  const openEditCourseForm = (course: CourseListItem) => {
    const category = categories.find((item) => item.nombre === course.categoriaNombre);
    const level = levels.find((item) => item.nombre === course.nivelNombre);

    setEditingCourseId(course.id);
    setCourseForm({
      titulo: course.titulo,
      descripcionCorta: course.descripcionCorta ?? '',
      idCategoria: category ? String(category.id) : '',
      idNivel: level ? String(level.id) : '',
      idInstructor: '',
    });
    setIsCourseFormOpen(true);
    setCourseSaveError('');
    setFeedback('');
  };

  const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingCourse(true);
    setCourseSaveError('');

    const payload: CourseCreateRequest | CourseUpdateRequest = {
      titulo: courseForm.titulo.trim(),
      descripcionCorta: courseForm.descripcionCorta.trim() || null,
      idCategoria: Number(courseForm.idCategoria),
      idNivel: Number(courseForm.idNivel),
    };

    try {
      if (editingCourseId != null) {
        await updateCourseApi(editingCourseId, payload);
        setFeedback(`Curso "${payload.titulo}" actualizado.`);
      } else if (isAdminVariant) {
        const adminPayload: CourseAdminCreateRequest = {
          ...payload,
          idInstructor: courseForm.idInstructor.trim(),
        };
        await createCourseApi(adminPayload);
        setFeedback(`Curso "${payload.titulo}" creado en borrador.`);
      } else {
        await createCourseApi(payload);
        setFeedback(`Curso "${payload.titulo}" creado en borrador.`);
      }

      setCourseForm(emptyCourseForm);
      setEditingCourseId(null);
      setIsCourseFormOpen(false);
      await loadCourses();
    } catch (error) {
      setCourseSaveError(
        getApiErrorMessage(
          error,
          editingCourseId != null
            ? 'No se pudo actualizar el curso. Intenta de nuevo.'
            : 'No se pudo crear el curso. Intenta de nuevo.',
        ),
      );
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleToggleStatus = async (course: CourseListItem) => {
    const currentStatus = normalizeCourseStatus(course.estado);
    const nextStatus = currentStatus === 'publicado' ? 'borrador' : 'publicado';

    setStatusUpdatingId(course.id);
    setFeedback('');

    try {
      await changeCourseStatusApi(course.id, { estado: nextStatus });
      setFeedback(
        `Curso "${course.titulo}" ${nextStatus === 'publicado' ? 'publicado' : 'movido a borrador'}.`,
      );
      await loadCourses();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'No se pudo cambiar el estado del curso.'));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteCourse = async (course: CourseListItem) => {
    const confirmed = window.confirm(
      `¿Eliminar el curso "${course.titulo}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeletingCourseId(course.id);
    setFeedback('');

    try {
      await deleteCourseApi(course.id);
      setFeedback(`Curso "${course.titulo}" eliminado.`);
      if (selectedCourseId === course.id) {
        setSelectedCourseId(null);
      }
      await loadCourses();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'No se pudo eliminar el curso.'));
    } finally {
      setDeletingCourseId(null);
    }
  };

  const openLessonCreate = () => {
    setLessonFormMode('create');
    setEditingLessonId(null);
    setLessonForm({ ...emptyLessonForm, orden: nextLessonOrden(lessons) });
    setLessonSaveError('');
    setIsLessonFormOpen(true);
  };

  const openLessonEdit = (lesson: Lesson) => {
    setLessonFormMode('edit');
    setEditingLessonId(lesson.id);
    setLessonForm({
      titulo: lesson.titulo,
      descripcion: lesson.descripcion ?? '',
      recurso: lesson.recurso ?? '',
      orden: lesson.orden,
    });
    setLessonSaveError('');
    setIsLessonFormOpen(true);
  };

  const handleLessonSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedCourseId == null) return;

    setIsSavingLesson(true);
    setLessonSaveError('');

    const payload: LessonRequest = {
      titulo: lessonForm.titulo.trim(),
      descripcion: lessonForm.descripcion?.trim() || null,
      recurso: lessonForm.recurso?.trim() || null,
      orden: lessonForm.orden,
    };

    try {
      if (lessonFormMode === 'edit' && editingLessonId != null) {
        await updateLessonApi(selectedCourseId, editingLessonId, payload);
        setFeedback(`Lección "${payload.titulo}" actualizada.`);
      } else {
        await createLessonApi(selectedCourseId, payload);
        setFeedback(`Lección "${payload.titulo}" creada.`);
      }

      setIsLessonFormOpen(false);
      setEditingLessonId(null);
      setLessonForm({ ...emptyLessonForm, orden: nextLessonOrden(lessons) });
      await loadLessons(selectedCourseId);
    } catch (error) {
      setLessonSaveError(
        getApiErrorMessage(error, 'No se pudo guardar la lección. Intenta de nuevo.'),
      );
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (selectedCourseId == null) return;

    const confirmed = window.confirm(`¿Eliminar la lección "${lesson.titulo}"?`);
    if (!confirmed) return;

    setDeletingLessonId(lesson.id);
    setFeedback('');

    try {
      await deleteLessonApi(selectedCourseId, lesson.id);
      setFeedback(`Lección "${lesson.titulo}" eliminada.`);
      await loadLessons(selectedCourseId);
    } catch (error) {
      setLessonsError(getApiErrorMessage(error, 'No se pudo eliminar la lección.'));
    } finally {
      setDeletingLessonId(null);
    }
  };

  const selectCourseForLessons = (courseId: number) => {
    setSelectedCourseId(courseId);
    setFeedback('');
    setIsLessonFormOpen(false);
    setEditingLessonId(null);
  };

  const pageTitle = isAdminVariant ? 'Cursos' : 'Mis cursos';
  const pageDescription = isAdminVariant
    ? 'Selecciona un curso para editar lecciones y estado.'
    : 'Selecciona un curso, gestiona lecciones y publícalo cuando esté listo.';

  return (
    <section className="manage-page" aria-labelledby="manage-courses-title">
      <header className="manage-header">
        <div>
          <h1 id="manage-courses-title">{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <button
          type="button"
          className="domain-btn-primary"
          onClick={() => {
            if (isCourseFormOpen && editingCourseId == null) {
              setIsCourseFormOpen(false);
              setCourseSaveError('');
              return;
            }
            openCreateCourseForm();
          }}
        >
          {isCourseFormOpen && editingCourseId == null ? 'Cerrar' : 'Nuevo curso'}
        </button>
      </header>

      {feedback && (
        <p className="domain-alert domain-alert-success manage-feedback" role="status">
          {feedback}
        </p>
      )}

      {isCourseFormOpen && (
        <div className="manage-form-wrap">
          <form className="domain-form" onSubmit={(event) => void handleCourseSubmit(event)}>
            <h2>{editingCourseId != null ? 'Editar curso' : 'Nuevo curso'}</h2>

            <label className="domain-field">
              <span>Título</span>
              <input
                type="text"
                required
                minLength={5}
                value={courseForm.titulo}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, titulo: event.target.value }))
                }
              />
            </label>

            <label className="domain-field">
              <span>Descripción corta</span>
              <textarea
                rows={2}
                value={courseForm.descripcionCorta}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    descripcionCorta: event.target.value,
                  }))
                }
              />
            </label>

            <div className="domain-form-grid">
              <label className="domain-field">
                <span>Categoría</span>
                <select
                  required
                  value={courseForm.idCategoria}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, idCategoria: event.target.value }))
                  }
                >
                  <option value="">Selecciona</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="domain-field">
                <span>Nivel</span>
                <select
                  required
                  value={courseForm.idNivel}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, idNivel: event.target.value }))
                  }
                >
                  <option value="">Selecciona</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isAdminVariant && editingCourseId == null && (
              <label className="domain-field">
                <span>Instructor</span>
                <select
                  required
                  value={courseForm.idInstructor}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, idInstructor: event.target.value }))
                  }
                >
                  <option value="">Selecciona un instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.nombre} {instructor.apellido}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {courseSaveError && (
              <p className="domain-inline-error" role="alert">
                {courseSaveError}
              </p>
            )}

            <div className="domain-form-actions">
              <button
                type="button"
                className="domain-btn-ghost"
                onClick={() => {
                  setIsCourseFormOpen(false);
                  setEditingCourseId(null);
                  setCourseSaveError('');
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="domain-btn-primary"
                disabled={
                  isSavingCourse ||
                  (isAdminVariant && editingCourseId == null && !courseForm.idInstructor.trim())
                }
              >
                {isSavingCourse
                  ? 'Guardando…'
                  : editingCourseId != null
                    ? 'Guardar'
                    : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="manage-filters" role="tablist" aria-label="Filtrar cursos">
        <button
          type="button"
          className={`manage-filter ${statusFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Todos ({courses.length})
        </button>
        <button
          type="button"
          className={`manage-filter ${statusFilter === 'publicado' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('publicado')}
        >
          Publicados ({publishedCount})
        </button>
        <button
          type="button"
          className={`manage-filter ${statusFilter === 'borrador' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('borrador')}
        >
          Borradores ({draftCount})
        </button>
      </div>

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando cursos…
        </p>
      ) : loadError ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="domain-btn-ghost" onClick={() => void loadCourses()}>
            Reintentar
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="domain-state domain-empty">
          <strong>Todavía no hay cursos</strong>
          <span>Crea el primero y añade lecciones antes de publicar.</span>
          <button type="button" className="domain-btn-primary" onClick={openCreateCourseForm}>
            Nuevo curso
          </button>
        </div>
      ) : (
        <div className="manage-layout">
          <aside className="manage-list-panel" aria-label="Lista de cursos">
            <div className="manage-list-head">
              <strong>Cursos</strong>
              <span>{filteredCourses.length}</span>
            </div>
            {filteredCourses.length === 0 ? (
              <p className="domain-state">No hay cursos en este filtro.</p>
            ) : (
              <ul className="manage-course-list">
                {filteredCourses.map((course) => {
                  const isPublished = normalizeCourseStatus(course.estado) === 'publicado';
                  const isActive = selectedCourseId === course.id;

                  return (
                    <li key={course.id}>
                      <button
                        type="button"
                        className={`manage-course-item ${isActive ? 'is-active' : ''}`}
                        onClick={() => selectCourseForLessons(course.id)}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <h2 className="manage-course-title">{course.titulo}</h2>
                        <span
                          className={`manage-course-status ${isPublished ? 'is-published' : 'is-draft'}`}
                        >
                          {course.estado}
                        </span>
                        <p className="manage-course-meta">
                          {course.categoriaNombre} · {course.nivelNombre}
                          {isAdminVariant ? ` · ${course.instructorNombre}` : ''}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <div className="manage-detail-panel">
            {!selectedCourse ? (
              <div className="manage-detail-empty">
                <strong>Elige un curso</strong>
                <span>Selecciona uno de la lista para ver lecciones y acciones.</span>
              </div>
            ) : (
              <>
                <div className="manage-course-toolbar">
                  <h2>{selectedCourse.titulo}</h2>
                  <button
                    type="button"
                    className="domain-btn-ghost"
                    disabled={statusUpdatingId === selectedCourse.id}
                    onClick={() => void handleToggleStatus(selectedCourse)}
                  >
                    {statusUpdatingId === selectedCourse.id
                      ? '…'
                      : normalizeCourseStatus(selectedCourse.estado) === 'publicado'
                        ? 'Pasar a borrador'
                        : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    className="domain-btn-ghost"
                    onClick={() => openEditCourseForm(selectedCourse)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="domain-btn-danger"
                    disabled={deletingCourseId === selectedCourse.id}
                    onClick={() => void handleDeleteCourse(selectedCourse)}
                  >
                    {deletingCourseId === selectedCourse.id ? '…' : 'Eliminar'}
                  </button>
                </div>

                <div className="lesson-workspace">
                  <LessonListPanel
                    courseTitle={selectedCourse.titulo}
                    lessons={lessons}
                    isLoading={isLoadingLessons}
                    error={lessonsError}
                    isFormOpen={isLessonFormOpen}
                    formMode={lessonFormMode}
                    formValue={lessonForm}
                    formError={lessonSaveError}
                    isSaving={isSavingLesson}
                    deletingLessonId={deletingLessonId}
                    compact
                    onRetry={() => void loadLessons(selectedCourse.id)}
                    onClosePanel={() => setSelectedCourseId(null)}
                    onOpenCreate={openLessonCreate}
                    onFormChange={setLessonForm}
                    onFormCancel={() => {
                      setIsLessonFormOpen(false);
                      setEditingLessonId(null);
                      setLessonSaveError('');
                    }}
                    onFormSubmit={(event) => void handleLessonSubmit(event)}
                    onEditLesson={openLessonEdit}
                    onDeleteLesson={(lesson) => void handleDeleteLesson(lesson)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
