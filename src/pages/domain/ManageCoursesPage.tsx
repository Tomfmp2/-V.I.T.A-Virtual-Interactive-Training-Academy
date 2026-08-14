import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/useAuth';
import { getCategoriesApi } from '../../api/categoriesApi';
import { getLevelsApi } from '../../api/levelsApi';
import {
  changeCourseStatusApi,
  createCourseApi,
  deleteCourseApi,
  getCoursesApi,
  getMyCoursesApi,
  updateCourseApi,
  uploadCourseCoverApi,
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
import { matchesCourseSearch } from '../../utils/courseSearch';
import { isAdminRole, normalizePlatformRole } from '../../utils/coursePermissions';
import { getCourseCoverUrl } from '../../utils/profilePhoto';
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

const COVER_ACCEPT = 'image/jpeg,image/png,image/webp';
const COVER_MAX_BYTES = 2 * 1024 * 1024;

export interface ManageCoursesPageProps {
  variant: 'instructor' | 'admin';
  /** Si viene desde el dashboard, abre el form de nuevo curso al montar */
  initialOpenCreate?: boolean;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
}

type CourseFormState = {
  titulo: string;
  descripcionCorta: string;
  idCategoria: string;
  idNivel: string;
  idInstructor: string;
  primeraLeccionTitulo: string;
  primeraLeccionDescripcion: string;
  primeraLeccionRecurso: string;
};

const emptyCourseForm: CourseFormState = {
  titulo: '',
  descripcionCorta: '',
  idCategoria: '',
  idNivel: '',
  idInstructor: '',
  primeraLeccionTitulo: '',
  primeraLeccionDescripcion: '',
  primeraLeccionRecurso: '',
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
  searchTerm = '',
  onSearchTermChange,
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
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(initialOpenCreate);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormState>(emptyCourseForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
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
    const byStatus =
      statusFilter === 'all'
        ? courses
        : courses.filter((course) => normalizeCourseStatus(course.estado) === statusFilter);

    return byStatus.filter((course) => matchesCourseSearch(course, localSearch));
  }, [courses, statusFilter, localSearch]);

  const handleCourseSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchTermChange?.(value);
  };

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
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

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

  const resetCoverState = () => {
    setCoverFile(null);
    setCoverPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return null;
    });
    setExistingCoverUrl(null);
  };

  const handleCoverFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] ?? null;
    if (!file) {
      setCoverFile(null);
      setCoverPreview((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
        return existingCoverUrl ? getCourseCoverUrl(existingCoverUrl) : null;
      });
      return;
    }

    if (!COVER_ACCEPT.split(',').includes(file.type)) {
      setCourseSaveError('Formato no permitido. Usa JPG, PNG o WEBP.');
      return;
    }

    if (file.size > COVER_MAX_BYTES) {
      setCourseSaveError('La imagen no puede superar 2 MB.');
      return;
    }

    setCourseSaveError('');
    setCoverFile(file);
    setCoverPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const openCreateCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm(emptyCourseForm);
    resetCoverState();
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
      primeraLeccionTitulo: '',
      primeraLeccionDescripcion: '',
      primeraLeccionRecurso: '',
    });
    setCoverFile(null);
    setCoverPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return getCourseCoverUrl(course.imagenPortadaUrl);
    });
    setExistingCoverUrl(course.imagenPortadaUrl ?? null);
    setIsCourseFormOpen(true);
    setCourseSaveError('');
    setFeedback('');
  };

  const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCourseSaveError('');

    if (editingCourseId == null) {
      if (isAdminVariant && !courseForm.idInstructor.trim()) {
        setCourseSaveError('Debes asignar un instructor al curso.');
        return;
      }

      if (!courseForm.primeraLeccionTitulo.trim()) {
        setCourseSaveError('Debes añadir al menos una lección al crear el curso.');
        return;
      }

      if (!coverFile) {
        setCourseSaveError('Debes seleccionar una imagen de portada.');
        return;
      }
    }

    setIsSavingCourse(true);

    const payload: CourseCreateRequest | CourseUpdateRequest = {
      titulo: courseForm.titulo.trim(),
      descripcionCorta: courseForm.descripcionCorta.trim() || null,
      idCategoria: Number(courseForm.idCategoria),
      idNivel: Number(courseForm.idNivel),
    };

    try {
      let courseId = editingCourseId;

      if (editingCourseId != null) {
        await updateCourseApi(editingCourseId, payload);
        setFeedback(`Curso "${payload.titulo}" actualizado.`);
      } else if (isAdminVariant) {
        const adminPayload: CourseAdminCreateRequest = {
          ...payload,
          idInstructor: courseForm.idInstructor.trim(),
        };
        const created = await createCourseApi(adminPayload);
        courseId = created.id;
        await createLessonApi(created.id, {
          titulo: courseForm.primeraLeccionTitulo.trim(),
          descripcion: courseForm.primeraLeccionDescripcion.trim() || null,
          recurso: courseForm.primeraLeccionRecurso.trim() || null,
          orden: 1,
        });
        setFeedback(`Curso "${payload.titulo}" creado con su primera lección.`);
        setSelectedCourseId(created.id);
      } else {
        const created = await createCourseApi(payload);
        courseId = created.id;
        await createLessonApi(created.id, {
          titulo: courseForm.primeraLeccionTitulo.trim(),
          descripcion: courseForm.primeraLeccionDescripcion.trim() || null,
          recurso: courseForm.primeraLeccionRecurso.trim() || null,
          orden: 1,
        });
        setFeedback(`Curso "${payload.titulo}" creado con su primera lección.`);
        setSelectedCourseId(created.id);
      }

      if (coverFile && courseId != null) {
        await uploadCourseCoverApi(courseId, coverFile);
      }

      setCourseForm(emptyCourseForm);
      setEditingCourseId(null);
      resetCoverState();
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

    if (nextStatus === 'publicado' && isAdminVariant) {
      setLoadError('Solo el instructor asignado puede publicar el curso.');
      return;
    }

    if (nextStatus === 'publicado') {
      let lessonCount =
        selectedCourseId === course.id ? lessons.length : null;

      if (lessonCount === null) {
        try {
          const courseLessons = await getLessonsApi(course.id);
          lessonCount = courseLessons.length;
        } catch {
          setLoadError('No se pudo verificar las lecciones del curso.');
          return;
        }
      }

      if (lessonCount === 0) {
        setLoadError('El curso debe tener al menos una lección antes de publicarse.');
        if (selectedCourseId !== course.id) {
          setSelectedCourseId(course.id);
        }
        return;
      }
    }

    setStatusUpdatingId(course.id);
    setFeedback('');
    setLoadError('');

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
    ? 'Crea cursos asignando un instructor y al menos una lección.'
    : 'Crea cursos con al menos una lección y publícalos cuando estén listos.';
  const isCreatingCourse = editingCourseId == null;
  const canPublishSelected =
    selectedCourse != null &&
    normalizeCourseStatus(selectedCourse.estado) !== 'publicado' &&
    lessons.length > 0;

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
          <form
            className="domain-form manage-course-form"
            onSubmit={(event) => void handleCourseSubmit(event)}
          >
            <header className="manage-form-head">
              <h2>{editingCourseId != null ? 'Editar curso' : 'Nuevo curso'}</h2>
              <p>
                {isCreatingCourse
                  ? 'Completa los datos del curso y añade la primera lección.'
                  : 'Actualiza la información general del curso.'}
              </p>
            </header>

            <section className="manage-form-section" aria-labelledby="manage-course-data-title">
              <h3 id="manage-course-data-title">Datos del curso</h3>

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

              <label className="domain-field">
                <span>Portada {isCreatingCourse ? '(obligatoria)' : '(opcional)'}</span>
                <input
                  type="file"
                  accept={COVER_ACCEPT}
                  required={isCreatingCourse}
                  onChange={(event) => handleCoverFileChange(event.target.files)}
                />
                <span className="manage-cover-hint">JPG, PNG o WEBP · máximo 2 MB</span>
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Vista previa de la portada"
                    className="manage-cover-preview"
                  />
                )}
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

              {isAdminVariant && isCreatingCourse && (
                <label className="domain-field">
                  <span>Instructor asignado</span>
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
                  {instructors.length === 0 && (
                    <p className="domain-inline-error" role="alert">
                      No hay instructores disponibles. Crea uno en Usuarios antes de crear cursos.
                    </p>
                  )}
                </label>
              )}
            </section>

            {isCreatingCourse && (
              <section
                className="manage-form-section manage-form-section-lesson"
                aria-labelledby="manage-first-lesson-title"
              >
                <h3 id="manage-first-lesson-title">Primera lección</h3>
                <p className="manage-form-section-desc">
                  Todo curso debe crearse con al menos una lección.
                </p>

                <label className="domain-field">
                  <span>Título de la lección</span>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={courseForm.primeraLeccionTitulo}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        primeraLeccionTitulo: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="domain-field">
                  <span>Descripción</span>
                  <textarea
                    rows={2}
                    value={courseForm.primeraLeccionDescripcion}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        primeraLeccionDescripcion: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="domain-field">
                  <span>Recurso</span>
                  <input
                    type="url"
                    placeholder="https://… (video, imagen o enlace)"
                    value={courseForm.primeraLeccionRecurso}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        primeraLeccionRecurso: event.target.value,
                      }))
                    }
                  />
                </label>
              </section>
            )}

            {courseSaveError && (
              <p className="domain-inline-error manage-form-error" role="alert">
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
                  resetCoverState();
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
                  (isAdminVariant &&
                    isCreatingCourse &&
                    (!courseForm.idInstructor.trim() || instructors.length === 0)) ||
                  (isCreatingCourse && !courseForm.primeraLeccionTitulo.trim()) ||
                  (isCreatingCourse && !coverFile)
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
            <div className="manage-list-search">
              <input
                type="search"
                value={localSearch}
                onChange={(event) => handleCourseSearchChange(event.target.value)}
                placeholder="Buscar por título, categoría…"
                aria-label="Buscar en mis cursos"
              />
            </div>
            {filteredCourses.length === 0 ? (
              <p className="domain-state">
                {localSearch.trim()
                  ? `Sin resultados para “${localSearch.trim()}”.`
                  : 'No hay cursos en este filtro.'}
              </p>
            ) : (
              <ul className="manage-course-list">
                {filteredCourses.map((course) => {
                  const isPublished = normalizeCourseStatus(course.estado) === 'publicado';
                  const isActive = selectedCourseId === course.id;
                  const coverSrc = getCourseCoverUrl(course.imagenPortadaUrl);

                  return (
                    <li key={course.id}>
                      <button
                        type="button"
                        className={`manage-course-item ${isActive ? 'is-active' : ''}`}
                        onClick={() => selectCourseForLessons(course.id)}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        {coverSrc ? (
                          <img
                            src={coverSrc}
                            alt=""
                            className="manage-course-thumb"
                          />
                        ) : (
                          <span className="manage-course-thumb manage-course-thumb-empty" aria-hidden />
                        )}
                        <div className="manage-course-item-body">
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
                        </div>
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
                    disabled={
                      statusUpdatingId === selectedCourse.id ||
                      (normalizeCourseStatus(selectedCourse.estado) !== 'publicado' &&
                        (!canPublishSelected || isAdminVariant))
                    }
                    title={
                      isAdminVariant &&
                      normalizeCourseStatus(selectedCourse.estado) !== 'publicado'
                        ? 'Solo el instructor asignado puede publicar el curso'
                        : !canPublishSelected &&
                            normalizeCourseStatus(selectedCourse.estado) !== 'publicado'
                          ? 'Añade al menos una lección para publicar'
                          : undefined
                    }
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
